import { z } from "zod";
import { router, protectedProcedure } from "./trpc";
import { TRPCError } from "@trpc/server";
import { Role } from "@prisma/client";

export const projectRouter = router({
  uploadProjects: protectedProcedure
    .input(
      z.array(
        z.object({
          name: z.string(),
          description: z.string().optional().default(""),
          link: z.string().optional().default(""),
          tracks: z.array(z.string()),
          status: z.string().optional().default("Draft"),
        }),
      ),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      try {
        // Get current dhYear from Config
        const dhYearConfig = await ctx.prisma.config.findUnique({
          where: { name: "dhYear" },
        });

        if (!dhYearConfig) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "dhYear not configured",
          });
        }

        // delete existing data for this year
        await ctx.prisma.projectTrack.deleteMany({
          where: {
            project: {
              dhYear: dhYearConfig.value,
            },
          },
        });
        await ctx.prisma.project.deleteMany({
          where: { dhYear: dhYearConfig.value },
        });

        // Create or get the General track
        const generalTrack = await ctx.prisma.track.upsert({
          where: { name: "General" },
          update: {},
          create: { name: "General" },
        });

        // Process and save projects to the database
        for (const project of input) {
          if (project.status === "Draft") {
            continue;
          }
          try {
            const createdProject = await ctx.prisma.project.create({
              data: {
                name: project.name,
                description: project.description,
                link: project.link,
                dhYear: dhYearConfig.value,
              },
            });

            // Add General track to every project
            await ctx.prisma.projectTrack.create({
              data: {
                projectId: createdProject.id,
                trackId: generalTrack.id,
              },
            });

            // Process other tracks and create project-track relations
            for (const trackName of project.tracks) {
              if (trackName.toUpperCase().includes("GODADDY")) {
                continue;
              }

              const normalizedTrackName = trackName
                .toUpperCase()
                .includes("MLH")
                ? "MLH"
                : trackName;

              const createdTrack = await ctx.prisma.track.upsert({
                where: { name: normalizedTrackName },
                update: {},
                create: { name: normalizedTrackName },
              });
              // use upsert to avoid duplicate entries
              await ctx.prisma.projectTrack.upsert({
                where: {
                  projectId_trackId: {
                    projectId: createdProject.id,
                    trackId: createdTrack.id,
                  },
                },
                update: {},
                create: {
                  projectId: createdProject.id,
                  trackId: createdTrack.id,
                },
              });
            }
          } catch (projectError) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Failed to process project ${project.name}: ${projectError}`,
            });
          }
        }

        return { message: "Projects uploaded successfully" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to upload projects: ${error}`,
        });
      }
    }),
  createTables: protectedProcedure
    .input(z.object({ projectsPerTable: z.number().min(1).max(25) }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      // First, clear existing tables and time slots
      await ctx.prisma.timeSlot.deleteMany();
      await ctx.prisma.table.deleteMany();

      const tracks = await ctx.prisma.track.findMany();
      let tableCounter = 1;

      // Create tables for each track
      for (const track of tracks) {
        // Special handling for MLH track - only create one table
        if (track.name === "MLH") {
          await ctx.prisma.table.create({
            data: {
              number: tableCounter++,
              trackId: track.id,
            },
          });
          continue;
        }

        const projectCount = await ctx.prisma.projectTrack.count({
          where: { trackId: track.id },
        });

        const tablesNeeded = Math.ceil(projectCount / input.projectsPerTable);

        // Create tables for this track
        for (let i = 0; i < tablesNeeded; i++) {
          await ctx.prisma.table.create({
            data: {
              number: tableCounter++,
              trackId: track.id,
            },
          });
        }
      }

      return { message: "Tables created successfully" };
    }),
  getNextProject: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        projectId: z.string().nullable(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (
        !(
          ctx.session.user.role.includes(Role.ADMIN) ||
          ctx.session.user.role.includes(Role.JUDGE)
        )
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const dhYearConfig = await ctx.prisma.config.findUnique({
        where: { name: "dhYear" },
      });

      if (!dhYearConfig) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "dhYear not configured",
        });
      }

      // If a specific project is requested, return it if it belongs to the table
      if (input.projectId) {
        const project = await ctx.prisma.project.findFirst({
          where: {
            id: input.projectId,
            TimeSlot: {
              some: {
                tableId: input.tableId,
              },
            },
          },
        });
        if (project) return project;
      }

      // Get already judged projects
      const judgedProjects = await ctx.prisma.judgingResult.findMany({
        where: {
          judgeId: ctx.session.user.id,
          dhYear: dhYearConfig.value,
        },
        select: { projectId: true },
      });

      // Find the next unjudged project by time slot order
      const timeSlot = await ctx.prisma.timeSlot.findFirst({
        where: {
          tableId: input.tableId,
          dhYear: dhYearConfig.value,
          projectId: {
            notIn: judgedProjects.map((jp) => jp.projectId),
          },
        },
        orderBy: {
          startTime: "asc",
        },
        include: {
          project: true,
        },
      });

      if (!timeSlot) {
        return null;
      }

      return timeSlot?.project;
    }),
  getAllProjects: protectedProcedure.query(async ({ ctx }) => {
    // we should make sure only accepted users can access this
    const dhYearConfig = await ctx.prisma.config.findUnique({
      where: { name: "dhYear" },
    });

    return ctx.prisma.project.findMany({
      where: {
        dhYear: dhYearConfig?.value,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  }),
  getProjectTimeSlots: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.timeSlot.findMany({
        where: {
          projectId: input.projectId,
        },
        include: {
          table: {
            include: {
              track: true,
            },
          },
        },
        orderBy: {
          startTime: "asc",
        },
      });
    }),
});

export const tableRouter = router({
  getTables: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.table.findMany({
      include: {
        track: true,
      },
    });
  }),
  getTableProjects: protectedProcedure
    .input(z.object({ tableId: z.string() }))
    .query(async ({ ctx, input }) => {
      const dhYearConfig = await ctx.prisma.config.findUnique({
        where: { name: "dhYear" },
      });

      const judgedProjects = await ctx.prisma.judgingResult.findMany({
        where: {
          judgeId: ctx.session.user.id,
          dhYear: dhYearConfig?.value,
        },
        select: {
          projectId: true,
        },
      });

      const judgedProjectIds = new Set(
        judgedProjects.map((jp) => jp.projectId),
      );

      const projects = await ctx.prisma.project.findMany({
        where: {
          TimeSlot: {
            some: {
              tableId: input.tableId,
            },
          },
        },
        include: {
          TimeSlot: {
            where: {
              tableId: input.tableId,
            },
            orderBy: {
              startTime: "asc",
            },
          },
        },
      });

      // Sort projects by their first TimeSlot's startTime
      const sortedProjects = projects.sort((a, b) => {
        const aTime = a.TimeSlot[0]?.startTime.getTime() ?? 0;
        const bTime = b.TimeSlot[0]?.startTime.getTime() ?? 0;
        return aTime - bTime;
      });

      return sortedProjects.map((project) => ({
        ...project,
        isJudged: judgedProjectIds.has(project.id),
      }));
    }),
});

export const trackRouter = router({
  getTracks: protectedProcedure.query(async ({ ctx }) => {
    const tracks = ctx.prisma.track.findMany();
    return tracks;
  }),
  createTrack: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const createdTrack = ctx.prisma.track.create({
        data: {
          name: input.name,
        },
      });
      return createdTrack;
    }),
});

export const judgingRouter = router({
  createJudgingResult: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        tableId: z.string(),
        responses: z.array(
          z.object({
            questionId: z.string(),
            score: z.number().min(0),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (
        !(
          ctx.session.user.role.includes(Role.ADMIN) ||
          ctx.session.user.role.includes(Role.JUDGE)
        )
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      // Get current dhYear from Config
      const dhYearConfig = await ctx.prisma.config.findUnique({
        where: { name: "dhYear" },
      });

      if (!dhYearConfig) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "dhYear not configured",
        });
      }

      // Check if this judge has already judged this project
      const existingResult = await ctx.prisma.judgingResult.findUnique({
        where: {
          judgeId_projectId: {
            judgeId: ctx.session.user.id,
            projectId: input.projectId,
          },
        },
      });

      return ctx.prisma.$transaction(async (tx) => {
        if (existingResult) {
          // Update existing responses
          await tx.rubricResponse.deleteMany({
            where: { judgingResultId: existingResult.id },
          });

          await tx.rubricResponse.createMany({
            data: input.responses.map((response) => ({
              judgingResultId: existingResult.id,
              questionId: response.questionId,
              score: response.score,
            })),
          });

          return existingResult;
        }

        // Create new judgment if none exists
        const judgingResult = await tx.judgingResult.create({
          data: {
            judgeId: ctx.session.user.id,
            projectId: input.projectId,
            tableId: input.tableId,
            dhYear: dhYearConfig.value,
          },
        });

        await tx.rubricResponse.createMany({
          data: input.responses.map((response) => ({
            judgingResultId: judgingResult.id,
            questionId: response.questionId,
            score: response.score,
          })),
        });

        return judgingResult;
      });
    }),

  // Get existing scores
  getProjectScores: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (
        !(
          ctx.session.user.role.includes(Role.ADMIN) ||
          ctx.session.user.role.includes(Role.JUDGE)
        )
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const result = await ctx.prisma.judgingResult.findUnique({
        where: {
          judgeId_projectId: {
            judgeId: ctx.session.user.id,
            projectId: input.projectId,
          },
        },
        include: {
          responses: true,
        },
      });

      return result?.responses || [];
    }),
  createRubricQuestion: protectedProcedure
    .input(
      z.object({
        question: z.string(),
        points: z.number().min(0).max(100),
        title: z.string(),
        trackId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // Create the rubric question
      const rubricQuestion = await ctx.prisma.rubricQuestion.create({
        data: {
          question: input.question,
          points: input.points,
          title: input.title,
          trackId: input.trackId,
        },
        include: {
          track: true, // Include track details in the response
        },
      });

      return rubricQuestion;
    }),
  getRubricQuestions: protectedProcedure
    .input(z.object({ trackId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (
        !(
          ctx.session.user.role.includes(Role.ADMIN) ||
          ctx.session.user.role.includes(Role.JUDGE)
        )
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      return ctx.prisma.rubricQuestion.findMany({
        where: {
          trackId: input.trackId,
        },
        orderBy: {
          id: "asc",
        },
      });
    }),
  getLeaderboard: protectedProcedure
    .input(
      z.object({
        trackId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      // Get current dhYear from Config
      const dhYearConfig = await ctx.prisma.config.findUnique({
        where: { name: "dhYear" },
      });

      if (!dhYearConfig) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "dhYear not configured",
        });
      }

      // Get all projects with their judging results and responses
      const projectScores = await ctx.prisma.project.findMany({
        where: {
          dhYear: dhYearConfig.value,
          ...(input.trackId && {
            tracks: {
              some: {
                trackId: input.trackId,
              },
            },
          }),
        },
        select: {
          id: true,
          name: true,
          link: true,
          tracks: {
            include: {
              track: true,
            },
          },
          judgingResults: {
            select: {
              responses: {
                select: {
                  score: true,
                  question: {
                    select: {
                      points: true,
                      trackId: true,
                    },
                  },
                },
              },
              judgeId: true,
            },
          },
        },
      });

      // Calculate total score for each project
      const leaderboard = projectScores.map((project) => {
        const judgeScores = new Map<
          string,
          { general: number; track: number }
        >();

        // Calculate scores per judge
        project.judgingResults.forEach((result) => {
          let generalScore = 0;
          let trackScore = 0;

          result.responses.forEach((response) => {
            const weightedScore = response.score * response.question.points;
            // If trackId matches input.trackId, it's a track-specific question
            // Otherwise, it's a general question
            if (input.trackId && response.question.trackId === input.trackId) {
              trackScore += weightedScore;
            } else if (!input.trackId || response.question.trackId === null) {
              generalScore += weightedScore;
            }
          });

          judgeScores.set(result.judgeId, {
            general: generalScore,
            track: trackScore,
          });
        });

        // Calculate average scores across judges
        let totalGeneralScore = 0;
        let totalTrackScore = 0;
        judgeScores.forEach((scores) => {
          totalGeneralScore += scores.general;
          totalTrackScore += scores.track;
        });

        const numberOfJudges = judgeScores.size;
        const averageGeneralScore =
          numberOfJudges > 0 ? totalGeneralScore / numberOfJudges : 0;
        const averageTrackScore =
          numberOfJudges > 0 ? totalTrackScore / numberOfJudges : 0;

        return {
          projectId: project.id,
          projectName: project.name,
          link: project.link,
          score: averageGeneralScore + averageTrackScore,
          numberOfJudges,
          trackName: project.tracks[0]?.track.name || "Unknown",
        };
      });

      // Sort by score in descending order
      return leaderboard.sort((a, b) => b.score - a.score);
    }),
  importRubricQuestions: protectedProcedure
    .input(
      z.object({
        questions: z.record(
          z.string(),
          z.array(
            z.object({
              title: z.string(),
              question: z.string(),
              points: z.number().min(0).max(100),
            }),
          ),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return ctx.prisma.$transaction(async (tx) => {
        const results = [];

        for (const [trackName, questions] of Object.entries(input.questions)) {
          // Create or get track
          const track = await tx.track.upsert({
            where: { name: trackName },
            update: {},
            create: { name: trackName },
          });

          // Delete existing questions for this track
          await tx.rubricQuestion.deleteMany({
            where: { trackId: track.id },
          });

          // Create new questions
          for (const q of questions) {
            const rubricQuestion = await tx.rubricQuestion.create({
              data: {
                title: q.title,
                question: q.question,
                points: q.points,
                trackId: track.id,
              },
            });
            results.push(rubricQuestion);
          }
        }

        return {
          message: "Rubric questions imported successfully",
          count: results.length,
        };
      });
    }),
});

export const timeSlotRouter = router({
  getTableTimeSlots: protectedProcedure
    .input(z.object({ tableId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (
        !(
          ctx.session.user.role.includes(Role.ADMIN) ||
          ctx.session.user.role.includes(Role.JUDGE)
        )
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // Get current dhYear from Config
      const dhYearConfig = await ctx.prisma.config.findUnique({
        where: { name: "dhYear" },
      });

      if (!dhYearConfig) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "dhYear not configured",
        });
      }

      return ctx.prisma.timeSlot.findMany({
        where: {
          tableId: input.tableId,
          dhYear: dhYearConfig.value,
        },
        include: {
          project: true,
        },
        orderBy: {
          startTime: "asc",
        },
      });
    }),
  createTimeSlots: protectedProcedure
    .input(
      z.object({
        slotDurationMinutes: z.number().min(1).default(10),
        startTime: z.string().datetime(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      // Get current dhYear from Config
      const dhYearConfig = await ctx.prisma.config.findUnique({
        where: { name: "dhYear" },
      });

      if (!dhYearConfig) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "dhYear not configured",
        });
      }

      // 1) Clear existing timeslots for this year
      await ctx.prisma.timeSlot.deleteMany({
        where: { dhYear: dhYearConfig.value },
      });

      // 2) Fetch tables & projectTracks
      const tables = await ctx.prisma.table.findMany({
        include: { track: true },
        orderBy: { number: "asc" },
      });
      if (tables.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No tables found.",
        });
      }

      const allProjectTracks = await ctx.prisma.projectTrack.findMany({
        include: {
          project: true,
          track: true,
        },
      });
      if (allProjectTracks.length === 0) {
        return {
          message: "No projectTrack entries found. Nothing to schedule.",
        };
      }

      // Separate MLH and non-MLH tracks
      const mlhProjectTracks = allProjectTracks.filter(
        (pt) => pt.track.name === "MLH",
      );
      const projectTracks = allProjectTracks.filter(
        (pt) => pt.track.name !== "MLH",
      );

      // Find the existing MLH table instead of creating a new one
      const mlhTable = tables.find((table) => table.track.name === "MLH");
      if (!mlhTable) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "MLH table not found.",
        });
      }

      // Create a map to track how many times each project has been skipped
      const starvingProjects = new Map<string, number>();
      // Initialize skip count for all projects
      projectTracks.forEach((pt) => {
        starvingProjects.set(pt.projectId, 0);
      });

      let currentTimeChunk = new Date(input.startTime);

      while (projectTracks.length > 0) {
        // main time loop

        const busyProjects = new Set<string>(); // projects already assigned for this time chunk

        for (const table of tables) {
          const tableTrack = table.track;
          const suitableProjects = projectTracks.filter(
            (pt) =>
              pt.trackId === tableTrack.id && !busyProjects.has(pt.projectId),
          );
          // Find project with highest starvation value
          const chosenProject = suitableProjects.reduce(
            (mostStarved, current) => {
              const currentStarvation =
                starvingProjects.get(current.projectId) || 0;
              const mostStarvedValue =
                starvingProjects.get(mostStarved?.projectId ?? "") || 0;
              return currentStarvation > mostStarvedValue
                ? current
                : mostStarved;
            },
            suitableProjects[0],
          );
          if (chosenProject) {
            await ctx.prisma.timeSlot.create({
              data: {
                tableId: table.id,
                projectId: chosenProject.projectId,
                startTime: currentTimeChunk,
                endTime: new Date(
                  new Date(currentTimeChunk).setMinutes(
                    currentTimeChunk.getMinutes() + input.slotDurationMinutes,
                  ),
                ),
                dhYear: dhYearConfig.value,
              },
            });
            projectTracks.splice(projectTracks.indexOf(chosenProject), 1);
            starvingProjects.set(chosenProject.projectId, 0);
            busyProjects.add(chosenProject.projectId);
          }
          // Increment starvation counter for remaining projects
          projectTracks.forEach((pt) => {
            const currentStarvation = starvingProjects.get(pt.projectId) || 0;
            starvingProjects.set(pt.projectId, currentStarvation + 1);
          });
        }

        // find projects that are not in the busyProjects set
        const availableForMlh = mlhProjectTracks.filter(
          (pt) => !busyProjects.has(pt.projectId),
        );

        // Schedule MLH judging slots
        const mlhSlotsToSchedule = Math.floor(input.slotDurationMinutes / 5);
        let mlhStartTime = currentTimeChunk;

        for (
          let i = 0;
          i < mlhSlotsToSchedule && availableForMlh.length > 0;
          i++
        ) {
          // Find project with highest starvation value among available MLH projects
          const chosenProject = availableForMlh.reduce(
            (mostStarved, current) => {
              const currentStarvation =
                starvingProjects.get(current.projectId) || 0;
              const mostStarvedValue =
                starvingProjects.get(mostStarved?.projectId ?? "") || 0;
              return currentStarvation > mostStarvedValue
                ? current
                : mostStarved;
            },
            availableForMlh[0],
          );

          if (chosenProject) {
            await ctx.prisma.timeSlot.create({
              data: {
                tableId: mlhTable.id,
                projectId: chosenProject.projectId,
                startTime: mlhStartTime,
                endTime: new Date(
                  new Date(mlhStartTime).setMinutes(
                    mlhStartTime.getMinutes() + 5,
                  ),
                ),
                dhYear: dhYearConfig.value,
              },
            });

            // Remove scheduled project from MLH pool and reset its starvation
            const indexInMlh = mlhProjectTracks.findIndex(
              (p) => p.projectId === chosenProject.projectId,
            );
            if (indexInMlh > -1) {
              mlhProjectTracks.splice(indexInMlh, 1);
            }

            // Also remove from availableForMlh
            const indexInAvailable = availableForMlh.findIndex(
              (p) => p.projectId === chosenProject.projectId,
            );
            if (indexInAvailable > -1) {
              availableForMlh.splice(indexInAvailable, 1);
            }

            starvingProjects.set(chosenProject.projectId, 0);
          }

          // Increment starvation counter for remaining MLH projects
          mlhProjectTracks.forEach((pt) => {
            const currentStarvation = starvingProjects.get(pt.projectId) || 0;
            starvingProjects.set(pt.projectId, currentStarvation + 1);
          });

          mlhStartTime = new Date(
            new Date(mlhStartTime).setMinutes(mlhStartTime.getMinutes() + 5),
          );
        }
        currentTimeChunk = new Date(
          new Date(currentTimeChunk).setMinutes(
            currentTimeChunk.getMinutes() + input.slotDurationMinutes,
          ),
        );
      }
      // Handle remaining MLH projects if any left
      for (const mlhProject of mlhProjectTracks) {
        await ctx.prisma.timeSlot.create({
          data: {
            tableId: mlhTable.id,
            projectId: mlhProject.projectId,
            startTime: currentTimeChunk,
            endTime: new Date(
              new Date(currentTimeChunk).setMinutes(
                currentTimeChunk.getMinutes() + 5, // 5 minute slots for MLH
              ),
            ),
            dhYear: dhYearConfig.value,
          },
        });

        currentTimeChunk = new Date(
          new Date(currentTimeChunk).setMinutes(
            currentTimeChunk.getMinutes() + 5,
          ),
        );
      }

      return {
        message: "Time slots created successfully",
        endTime: currentTimeChunk,
        numTables: tables.length,
      };
    }),
  getAllTimeSlots: protectedProcedure.query(async ({ ctx }) => {
    if (
      !(
        ctx.session.user.role.includes(Role.ADMIN) ||
        ctx.session.user.role.includes(Role.JUDGE)
      )
    ) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const timeSlots = await ctx.prisma.timeSlot.findMany({
      select: {
        startTime: true,
        endTime: true,
      },
      distinct: ["startTime"],
      orderBy: {
        startTime: "asc",
      },
    });
    return timeSlots;
  }),
  getAssignmentsAtTime: protectedProcedure
    .input(z.object({ time: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const assignments = await ctx.prisma.timeSlot.findMany({
        where: {
          startTime: new Date(input.time),
        },
        include: {
          project: true,
          table: true,
        },
      });

      // Convert to a map of tableId -> project
      const tableAssignments: Record<string, { id: string; name: string }> = {};
      assignments.forEach((assignment) => {
        tableAssignments[assignment.tableId] = {
          id: assignment.project.id,
          name: assignment.project.name,
        };
      });

      return tableAssignments;
    }),
});

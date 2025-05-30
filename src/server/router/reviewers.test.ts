import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reviewerRouter } from './reviewers';
import { Prisma, Status, Role } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { Session } from 'next-auth';
import ApplicationSchema from '../../schemas/application'; // Assuming this is the correct path

// Mock Prisma
const mockPrisma = {
  user: {
    findMany: vi.fn(),
  },
  dH11Application: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
  dH11Review: {
    groupBy: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    findMany: vi.fn(),
  },
  dH12Application: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
  dH12Review: {
    groupBy: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    findMany: vi.fn(),
  },
};

const mockLogsnag = { track: vi.fn() };

const mockReviewerSession: Session = {
  user: { id: 'test-reviewer-id', name: 'Reviewer User', email: 'reviewer@example.com', role: [Role.REVIEWER] },
  expires: '1',
};

const mockAdminSession: Session = {
    user: { id: 'test-admin-id', name: 'Admin User', email: 'admin@example.com', role: [Role.ADMIN] },
    expires: '1',
};


const getMockContext = (session: Session = mockReviewerSession) => ({
  prisma: mockPrisma,
  session: session,
  logsnag: mockLogsnag,
});

describe('reviewerRouter', () => {
  let ctx: ReturnType<typeof getMockContext>;
  let caller: ReturnType<typeof reviewerRouter.createCaller>;

  beforeEach(() => {
    vi.resetAllMocks();
    ctx = getMockContext(); // Default to reviewer session
    caller = reviewerRouter.createCaller(ctx);
  });
  
  const sampleApplicationData = {
      firstName: "Test", lastName: "User", phone: "1234567890", country: "Canada",
      birthday: new Date("2000-01-01"), studyEnrolledPostSecondary: true,
      studyLocation: "Test University", studyDegree: "B.Sc.", studyMajor: "Computer Science",
      studyYearOfStudy: "3rd Year", studyExpectedGraduation: new Date("2025-05-01"),
      previousHackathonsCount: 0, longAnswerIncident: "Test incident.",
      longAnswerGoals: "Test goals.", longAnswerFood: "Test food.",
      longAnswerTravel: "Test travel.", longAnswerSocratica: "Test socratica.",
      socialText: ["https://linkedin.com/in/testuser"], interests: "Testing",
      tshirtSize: "M", hackerKind: ["Developer"], alreadyHaveTeam: false,
      workshopChoices: ["AI Workshop"], discoverdFrom: ["Social Media"], considerCoffee: true,
      dietaryRestrictions: "None", underrepresented: "NO" as const, gender: "Prefer not to say",
      race: "Prefer not to say", orientation: "Prefer not to say",
      emergencyContactName: "Emergency Contact", emergencyContactPhone: "0987654321",
      emergencyContactRelation: "Friend", agreeToMLHCodeOfConduct: true,
      agreeToMLHPrivacyPolicy: true, agreeToMLHCommunications: false,
      status: Status.IN_REVIEW,
      rsvpCheck: false,
      // Not including User, DH11Review, DH12Review relations for base data
  };


  describe('getApplications query', () => {
    it('should return DH12 applications with review stats for reviewer', async () => {
      const mockUsers = [
        { id: 'user1', name: 'User One', email: 'user1@example.com', status: Status.IN_REVIEW, DH12ApplicationId: 'dh12app1' },
        { id: 'user2', name: 'User Two', email: 'user2@example.com', status: Status.IN_REVIEW, DH12ApplicationId: 'dh12app2' },
      ];
      mockPrisma.user.findMany.mockResolvedValue(mockUsers);
      mockPrisma.dH12Review.groupBy.mockResolvedValue([
        { applicationId: 'dh12app1', _count: { applicationId: 1 }, _avg: { score: 10 } },
      ]);

      const result = await caller.getApplications();

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { DH12ApplicationId: { not: null } } }));
      expect(mockPrisma.dH12Review.groupBy).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].applicationId).toBe('dh12app1');
      expect(result[0].reviewCount).toBe(1);
      expect(result[0].avgScore).toBe(10);
      expect(result[1].applicationId).toBe('dh12app2');
      expect(result[1].reviewCount).toBe(0); // No review stats for dh12app2
    });
  });

  describe('getApplication query', () => {
    it('should fetch a DH12 application and reviewer status', async () => {
      const appId = 'dh12testapp';
      mockPrisma.dH12Application.findUnique.mockResolvedValue({ ...sampleApplicationData, id: appId });
      mockPrisma.dH12Review.findFirst.mockResolvedValue(null); // Not reviewed by current reviewer

      const result = await caller.getApplication({ applicationId: appId });

      expect(mockPrisma.dH12Application.findUnique).toHaveBeenCalledWith({ where: { id: appId } });
      expect(mockPrisma.dH12Review.findFirst).toHaveBeenCalledWith({
        where: { applicationId: appId, reviewerId: mockReviewerSession.user.id },
      });
      expect(result.firstName).toBe(sampleApplicationData.firstName);
      expect(result.hasReviewed).toBe(false);
    });

    it('should fetch a DH11 application if DH12 not found', async () => {
        const appId = 'dh11testapp';
        mockPrisma.dH12Application.findUnique.mockResolvedValue(null); // Not found as DH12
        mockPrisma.dH11Application.findUnique.mockResolvedValue({ ...sampleApplicationData, id: appId });
        mockPrisma.dH11Review.findFirst.mockResolvedValue({ id: 'review1' } as any); // Reviewed

        const result = await caller.getApplication({ applicationId: appId });
        expect(mockPrisma.dH11Application.findUnique).toHaveBeenCalledWith({ where: { id: appId } });
        expect(mockPrisma.dH11Review.findFirst).toHaveBeenCalled();
        expect(result.hasReviewed).toBe(true);
    });
    
    it('should throw NOT_FOUND if application does not exist as DH11 or DH12', async () => {
        const appId = 'nonexistentapp';
        mockPrisma.dH12Application.findUnique.mockResolvedValue(null);
        mockPrisma.dH11Application.findUnique.mockResolvedValue(null);
        await expect(caller.getApplication({ applicationId: appId })).rejects.toThrowError(/Application not found./);
    });
  });

  describe('submitScore mutation', () => {
    const scoreInput = { applicationId: 'dh12appIdScore', score: 12, comment: 'Good effort' };

    it('should submit a score for a DH12 application', async () => {
      mockPrisma.dH12Application.findUnique.mockResolvedValue({ ...sampleApplicationData, id: scoreInput.applicationId, User: {name: 'Test User', email: 'test@example.com'} });
      mockPrisma.dH12Review.findFirst.mockResolvedValue(null); // No existing review
      mockPrisma.dH12Review.create.mockResolvedValue({ ...scoreInput, id: 'newReviewId', reviewerId: mockReviewerSession.user.id });

      await caller.submitScore(scoreInput);

      expect(mockPrisma.dH12Review.create).toHaveBeenCalledWith({
        data: { ...scoreInput, reviewerId: mockReviewerSession.user.id },
      });
      expect(mockLogsnag.track).toHaveBeenCalled();
    });
    
    it('should submit a score for a DH11 application if DH12 not found', async () => {
        const dh11ScoreInput = { applicationId: 'dh11appIdScore', score: 10, comment: 'Okay' };
        mockPrisma.dH12Application.findUnique.mockResolvedValue(null); // Not a DH12 app
        mockPrisma.dH11Application.findUnique.mockResolvedValue({ ...sampleApplicationData, id: dh11ScoreInput.applicationId, User: {name: 'Test User', email: 'test@example.com'} });
        mockPrisma.dH11Review.findFirst.mockResolvedValue(null);
        mockPrisma.dH11Review.create.mockResolvedValue({ ...dh11ScoreInput, id: 'newDh11ReviewId', reviewerId: mockReviewerSession.user.id });

        await caller.submitScore(dh11ScoreInput);
        expect(mockPrisma.dH11Review.create).toHaveBeenCalledWith({
            data: { ...dh11ScoreInput, reviewerId: mockReviewerSession.user.id },
        });
    });

    it('should throw CONFLICT if application already reviewed', async () => {
      mockPrisma.dH12Application.findUnique.mockResolvedValue({ ...sampleApplicationData, id: scoreInput.applicationId });
      mockPrisma.dH12Review.findFirst.mockResolvedValue({ id: 'existingReview' } as any); // Existing review

      await expect(caller.submitScore(scoreInput)).rejects.toThrowError(/You have already reviewed this application/);
    });
  });

  describe('getReviewsForApplication query', () => {
    const appId = 'appWithReviews';
    it('should return reviews for a DH12 application', async () => {
        mockPrisma.dH12Application.findUnique.mockResolvedValue({ id: appId } as any); // App exists as DH12
        mockPrisma.dH12Review.findMany.mockResolvedValue([{ id: 'r1', score: 10 }, { id: 'r2', score: 12 }] as any);

        const result = await caller.getReviewsForApplication({ applicationId: appId });
        expect(mockPrisma.dH12Review.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { applicationId: appId } }));
        expect(result).toHaveLength(2);
    });
    it('should return reviews for a DH11 application if DH12 not found', async () => {
        mockPrisma.dH12Application.findUnique.mockResolvedValue(null); // Not a DH12 app
        mockPrisma.dH11Application.findUnique.mockResolvedValue({ id: appId } as any); // App exists as DH11
        mockPrisma.dH11Review.findMany.mockResolvedValue([{ id: 'r3', score: 8 }] as any);

        const result = await caller.getReviewsForApplication({ applicationId: appId });
        expect(mockPrisma.dH11Review.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { applicationId: appId } }));
        expect(result).toHaveLength(1);
    });
  });
  
  describe('updateStatus mutation (Admin only)', () => {
    const updateStatusInput = { applicationId: 'appToUpdateStatus', status: Status.ACCEPTED };
    beforeEach(() => { // Switch to Admin context for these tests
        ctx = getMockContext(mockAdminSession); 
        caller = reviewerRouter.createCaller(ctx);
    });

    it('should update status for a DH12 application', async () => {
        mockPrisma.dH12Application.findUnique.mockResolvedValue({id: updateStatusInput.applicationId} as any);
        mockPrisma.dH12Application.update.mockResolvedValue({ ...updateStatusInput, User: {name: 'U', email: 'e'} } as any);

        await caller.updateStatus(updateStatusInput);
        expect(mockPrisma.dH12Application.update).toHaveBeenCalledWith(expect.objectContaining({ where: {id: updateStatusInput.applicationId}, data: {status: updateStatusInput.status}}));
    });
    
    it('should update status for a DH11 application if DH12 not found', async () => {
        mockPrisma.dH12Application.findUnique.mockResolvedValue(null);
        mockPrisma.dH11Application.findUnique.mockResolvedValue({id: updateStatusInput.applicationId} as any);
        mockPrisma.dH11Application.update.mockResolvedValue({ ...updateStatusInput, User: {name: 'U', email: 'e'} } as any);
        
        await caller.updateStatus(updateStatusInput);
        expect(mockPrisma.dH11Application.update).toHaveBeenCalledWith(expect.objectContaining({ where: {id: updateStatusInput.applicationId}, data: {status: updateStatusInput.status}}));
    });

    it('should throw NOT_FOUND if no application to update status', async () => {
        mockPrisma.dH12Application.findUnique.mockResolvedValue(null);
        mockPrisma.dH11Application.findUnique.mockResolvedValue(null);
        await expect(caller.updateStatus(updateStatusInput)).rejects.toThrowError(/Application not found to update./);
    });
  });

  describe('updateApplicationStatusByScoreRange (Admin only)', () => {
    const scoreRangeInput = { status: Status.WAITLISTED, minRange: 10, maxRange: 12 };
     beforeEach(() => { // Switch to Admin context for these tests
        ctx = getMockContext(mockAdminSession); 
        caller = reviewerRouter.createCaller(ctx);
    });
    it('should update DH12 application statuses based on score range', async () => {
        const mockUsers = [
            { id: 'user1', DH12ApplicationId: 'dh12app1' },
            { id: 'user2', DH12ApplicationId: 'dh12app2' },
        ];
        mockPrisma.user.findMany.mockResolvedValue(mockUsers as any);
        mockPrisma.dH12Review.groupBy.mockResolvedValue([ // Scores: app1=11 (in range), app2=9 (not in range)
            { applicationId: 'dh12app1', _count: { applicationId: 1 }, _avg: { score: 11 } },
            { applicationId: 'dh12app2', _count: { applicationId: 1 }, _avg: { score: 9 } },
        ]);
        mockPrisma.dH12Application.updateMany.mockResolvedValue({ count: 1 });

        await caller.updateApplicationStatusByScoreRange(scoreRangeInput);

        expect(mockPrisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { DH12ApplicationId: { not: null } } }));
        expect(mockPrisma.dH12Review.groupBy).toHaveBeenCalled();
        expect(mockPrisma.dH12Application.updateMany).toHaveBeenCalledWith({
            where: { id: { in: ['dh12app1'] } }, // Only dh12app1 is in score range
            data: { status: scoreRangeInput.status },
        });
    });
  });

});

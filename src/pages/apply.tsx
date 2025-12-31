import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import { prisma } from "../server/db/client";
import { trpc } from "../utils/trpc";
import Drawer from "../components/Drawer";
import { DynamicForm } from "../components/DynamicForm";
import { ApplicationSchema, FormData } from "../types/application";
import { Button } from "../components/Button";
import { useState } from "react";

type ApplyPageProps = {
  email: string | null;
  killed: boolean;
  userId: string;
  dhYear: string;
  schema: ApplicationSchema | null;
  hasExistingApplication: boolean;
};

const Apply: NextPage<ApplyPageProps> = ({
  email,
  killed,
  userId,
  dhYear,
  schema,
  hasExistingApplication,
}) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createApplication =
    trpc.applicationSchema.submitApplication.useMutation({
      onSuccess: () => {
        router.push("/dashboard");
      },
      onError: (err) => {
        setError(err.message);
        setIsSubmitting(false);
      },
    });

  const handleSubmit = async (data: FormData) => {
    if (!schema) {
      setError("No application schema found for this hackathon");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createApplication.mutateAsync({
        schemaId: schema.id,
        answers: data,
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (hasExistingApplication) {
    router.push("/dashboard");
    return null;
  }

  return (
    <>
      <Head>
        <title>Apply - DeltaHacks</title>
      </Head>
      <Drawer fullScreen>
        <div className="drawer-body">
          <div className="flex flex-col items-center justify-center w-full h-full max-w-4xl mx-auto">
            <div className="w-full max-w-4xl px-4">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-center text-black md:text-left dark:text-white">
                  Apply for {dhYear}
                </h1>
                <p className="text-center text-black md:text-left dark:text-white">
                  Join us for an incredible weekend of building and innovation
                </p>
              </div>

              {killed ? (
                <div className="flex flex-col items-center justify-center h-full py-4 text-center">
                  <div className="text-2xl text-center text-black bg-red-600 alert dark:text-white md:text-left">
                    <span>
                      Applications are now closed. For any questions, please
                      contact us at{" "}
                      <span className="font-bold">hello@deltahacks.com</span>
                    </span>
                  </div>
                </div>
              ) : !schema ? (
                <div className="flex flex-col items-center justify-center h-full py-4 text-center">
                  <div className="text-xl text-center text-black dark:text-white">
                    <p>Applications for {dhYear} are not yet open.</p>
                    <p className="mt-2 text-neutral-500">
                      Please check back later!
                    </p>
                  </div>
                </div>
              ) : schema.fields.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-4 text-center">
                  <div className="text-xl text-center text-black dark:text-white">
                    <p>Application form is being prepared.</p>
                    <p className="mt-2 text-neutral-500">
                      Please check back soon!
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                      {error}
                    </div>
                  )}
                  <DynamicForm
                    schema={schema}
                    onSubmit={handleSubmit}
                    submitLabel="Submit Application"
                    showSubmitButton={!isSubmitting}
                  />
                  {isSubmitting && (
                    <div className="flex flex-col items-center justify-center py-4 text-center">
                      <div className="text-lg text-black dark:text-white">
                        Submitting your application...
                        <div className="loading loading-infinity loading-lg"></div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const session = await getServerAuthSession(context);

  if (!session || !session.user) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  const userEntry = await prisma.user.findFirst({
    where: { id: session.user.id },
    include: { applicationResponses: true },
  });

  const killConfig = await prisma.config.findFirst({
    where: { name: "killApplications" },
    select: { value: true },
  });

  const dhYearConfig = await prisma.config.findFirst({
    where: { name: "dhYear" },
    select: { value: true },
  });

  const dhYear = dhYearConfig?.value || "DH13";

  const schema = await prisma.applicationSchema.findFirst({
    where: {
      dhYear: dhYear,
      isPublished: true,
      isActive: true,
    },
    include: {
      fields: {
        orderBy: { order: "asc" },
      },
    },
  });

  let killed = true;
  if (killConfig && JSON.parse(killConfig.value) === false) {
    killed = false;
  }

  const hasExistingApplication = userEntry?.applicationResponses.some(
    (r) => r.schemaId === schema?.id,
  );

  if (hasExistingApplication) {
    return { redirect: { destination: "/dashboard", permanent: false } };
  }

  return {
    props: {
      email: session.user.email,
      killed,
      userId: session.user.id,
      dhYear,
      schema: schema
        ? {
            id: schema.id,
            name: schema.name,
            description: schema.description,
            dhYear: schema.dhYear,
            isPublished: schema.isPublished,
            isActive: schema.isActive,
            createdAt: schema.createdAt.toISOString(),
            updatedAt: schema.updatedAt.toISOString(),
            fields: schema.fields.map((f) => ({
              id: f.id,
              key: f.key,
              label: f.label,
              type: f.type as any,
              description: f.description,
              placeholder: f.placeholder,
              required: f.required,
              order: f.order,
              validation: f.validation as any,
              options: f.options as any,
            })),
          }
        : null,
      hasExistingApplication,
    },
  };
};

export default Apply;

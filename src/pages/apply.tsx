import type { GetServerSidePropsContext, NextPage } from "next";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import { prisma } from "../server/db/client";
import { trpc } from "../utils/trpc";
import { useRouter } from "next/router";
import { useForm, SubmitHandler } from "react-hook-form";
import FormTextInput from "../components/FormTextInput";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Head from "next/head";
import Link from "next/link";
import { Drawer } from "../components/NavBar";
import { DH10ApplicationCreateInputSchema } from "../../prisma/generated/zod";

// export type Inputs = {
//   name: string;
// };

// const schema = z.object({
//   name: z.string(),
//   email: z.string().email(),
//   age: z.number().min(15),
// });

const schema = DH10ApplicationCreateInputSchema;

export type InputsType = z.infer<typeof schema>;

const Apply: NextPage = () => {
  const router = useRouter();
  const submitResponseId = trpc.application.submit.useMutation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InputsType>({
    resolver: zodResolver(schema),
  });
  const onSubmit: SubmitHandler<InputsType> = (data) => {
    console.log(data);
    schema.parse(data);
  };

  try {
    schema.parse(watch()); // watch input value by passing the name of it
  } catch (err) {
    console.log(err);
  }

  return (
    <>
      <Head>
        <title>Welcome - DeltaHacks X</title>
      </Head>
      <Drawer>
        <form onSubmit={handleSubmit(onSubmit)} className="bg-red-500">
          <FormTextInput
            register={register}
            question={"What's your name ?"}
            inputType={"name"}
          />
          <FormTextInput
            register={register}
            question={"What's your email ?"}
            inputType={"email"}
          />
          {/*proof of concept components propegating the errors is going to be
        painful because of how react form works */}
          <input
            type="number"
            {...register("age", { valueAsNumber: true })}
            className="input input-bordered w-full max-w-xs"
          />
          {errors.age?.message && <span>{errors.age?.message}</span>}
          <input type="submit" className="btn btn-primary" />
        </form>
      </Drawer>
    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);

  if (!session || !session.user) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  const userEntry = await prisma.user.findFirst({
    where: { id: session.user.id },
  });

  // If submitted then go dashboard
  if (
    userEntry &&
    (userEntry.typeform_response_id === null ||
      userEntry.typeform_response_id === undefined)
  ) {
    return { props: {} };
  }
  return { redirect: { destination: "/dashboard", permanent: false } };
};

export default Apply;

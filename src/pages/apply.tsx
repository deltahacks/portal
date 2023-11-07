import type { GetServerSidePropsContext, NextPage } from "next";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import { prisma } from "../server/db/client";
import { trpc } from "../utils/trpc";
import { useRouter } from "next/router";
import { useForm, SubmitHandler } from "react-hook-form";
import FormTextInput from "../components/FormTextInput";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// export type Inputs = {
//   name: string;
// };

const schema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().min(15),
});

export type InputsType = z.infer<typeof schema>;

const Apply: NextPage = () => {
  const router = useRouter();
  const submitResponseId = trpc.application.submit.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InputsType>({
    resolver: zodResolver(schema),
  });
  const onSubmit: SubmitHandler<InputsType> = (data) => {
    console.log(data);
  };

  // console.log(watch("example")) // watch input value by passing the name of it

  return (
    <div className="flex items-center justify-center">
      <form onSubmit={handleSubmit(onSubmit)}>
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
    </div>
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

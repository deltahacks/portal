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
import { DH10ApplicationModel } from "../../prisma/zod/dh10application";

// export type Inputs = {
//   name: string;
// };

// const schema = z.object({
//   name: z.string(),
//   email: z.string().email(),
//   age: z.number().min(15),
// });

const schema = DH10ApplicationModel.omit({ id: true });

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
    // schema.parse(data);
  };

  return (
    <>
      <Head>
        <title>Welcome - DeltaHacks X</title>
      </Head>
      <Drawer>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto flex w-1/2 max-w-4xl flex-col bg-red-500"
        >
          <div>
            <label htmlFor="firstNameInput">First Name</label>
            <input
              type="text"
              id="firstNameInput"
              {...register("firstName", { required: true })}
            />
            {errors.firstName && <span>This field is required</span>}
          </div>

          <div>
            <label htmlFor="lastNameInput">Last Name</label>
            <input
              type="text"
              id="lastNameInput"
              {...register("lastName", { required: true })}
            />
            {errors.lastName && <span>This field is required</span>}
          </div>

          <div>
            <label htmlFor="birthdayInput">Birthday</label>
            <input
              type="date"
              id="birthdayInput"
              {...register("birthday", { required: true })}
            />
            {errors.birthday && <span>This field is required</span>}
          </div>

          <div>
            <label htmlFor="studyEnrolledPostSecondaryInput">
              Enrolled in Post Secondary?
            </label>
            <input
              type="checkbox"
              id="studyEnrolledPostSecondaryInput"
              {...register("studyEnrolledPostSecondary")}
            />
          </div>

          <div>
            <label htmlFor="studyLocationInput">Study Location</label>
            <input
              type="text"
              id="studyLocationInput"
              {...register("studyLocation", { required: true })}
            />
            {errors.studyLocation && <span>This field is required</span>}
          </div>

          <div>
            <label htmlFor="studyDegreeInput">Study Degree</label>
            <input
              type="text"
              id="studyDegreeInput"
              {...register("studyDegree", { required: true })}
            />
            {errors.studyDegree && <span>This field is required</span>}
          </div>

          <div>
            <label htmlFor="studyMajorInput">Study Major</label>
            <input
              type="text"
              id="studyMajorInput"
              {...register("studyMajor", { required: true })}
            />
            {errors.studyMajor && <span>This field is required</span>}
          </div>

          <div>
            <label htmlFor="studyYearOfStudyInput">Year of Study</label>
            <input
              type="number"
              id="studyYearOfStudyInput"
              {...register("studyYearOfStudy", { required: true })}
            />
            {errors.studyYearOfStudy && <span>This field is required</span>}
          </div>

          <div>
            <label htmlFor="studyExpectedGraduationInput">
              Expected Graduation
            </label>
            <input
              type="date"
              id="studyExpectedGraduationInput"
              {...register("studyExpectedGraduation", { required: true })}
            />
            {errors.studyExpectedGraduation && (
              <span>This field is required</span>
            )}
          </div>

          <div>
            <label htmlFor="previousHackathonsCountInput">
              Previous Hackathons Count
            </label>
            <input
              type="number"
              id="previousHackathonsCountInput"
              {...register("previousHackathonsCount", { required: true })}
            />
            {errors.previousHackathonsCount && (
              <span>This field is required</span>
            )}
          </div>

          <div>
            <label htmlFor="longAnswerChangeInput">Long Answer: Change</label>
            <textarea
              id="longAnswerChangeInput"
              {...register("longAnswerChange", { required: true })}
            />
            {errors.longAnswerChange && <span>This field is required</span>}
          </div>

          <div>
            <label htmlFor="longAnswerExperienceInput">
              Long Answer: Experience
            </label>
            <textarea
              id="longAnswerExperienceInput"
              {...register("longAnswerExperience", { required: true })}
            />
            {errors.longAnswerExperience && <span>This field is required</span>}
          </div>

          <div>
            <label htmlFor="longAnswerTechInput">Long Answer: Tech</label>
            <textarea
              id="longAnswerTechInput"
              {...register("longAnswerTech", { required: true })}
            />
            {errors.longAnswerTech && <span>This field is required</span>}
          </div>

          <div>
            <label htmlFor="longAnswerMeaningInput">Long Answer: Meaning</label>
            <textarea
              id="longAnswerMeaningInput"
              {...register("longAnswerMeaning", { required: true })}
            />
            {errors.longAnswerMeaning && <span>This field is required</span>}
          </div>

          <div>
            <label htmlFor="longAnswerFutureInput">Long Answer: Future</label>
            <textarea
              id="longAnswerFutureInput"
              {...register("longAnswerFuture", { required: true })}
            />
            {errors.longAnswerFuture && <span>This field is required</span>}
          </div>

          <div>
            <label htmlFor="longAnswerMagicInput">Long Answer: Magic</label>
            <textarea
              id="longAnswerMagicInput"
              {...register("longAnswerMagic", { required: true })}
            />
            {errors.longAnswerMagic && <span>This field is required</span>}
          </div>

          <div>
            <label htmlFor="socialTextInput">Social Text</label>
            <input
              type="text"
              id="socialTextInput"
              {...register("socialText")}
            />
          </div>

          <div>
            <label htmlFor="interestsInput">Interests</label>
            <input type="text" id="interestsInput" {...register("interests")} />
          </div>

          <div>
            <label htmlFor="tshirtSizeInput">T-shirt Size</label>
            <input
              type="text"
              id="tshirtSizeInput"
              {...register("tshirtSize", { required: true })}
            />
            {errors.tshirtSize && <span>This field is required</span>}
          </div>

          <div>
            <label htmlFor="hackerKindInput">Hacker Kind</label>
            <input
              type="text"
              id="hackerKindInput"
              {...register("hackerKind", { required: true })}
            />
            {errors.hackerKind && <span>This field is required</span>}
          </div>

          <div>
            <label htmlFor="alreadyHaveTeamInput">Already Have a Team?</label>
            <input
              type="checkbox"
              id="alreadyHaveTeamInput"
              {...register("alreadyHaveTeam")}
            />
          </div>

          <div>
            <label htmlFor="workshopChoicesInput">Workshop Choices</label>
            <select
              id="workshopChoicesInput"
              {...register("workshopChoices", { required: true })}
              multiple
            >
              <option value="Workshop A">Workshop A</option>
              <option value="Workshop B">Workshop B</option>
              <option value="Workshop C">Workshop C</option>
            </select>
            {errors.workshopChoices && <span>This field is required</span>}
          </div>

          <div>
            <label htmlFor="considerCoffeeInput">Consider Coffee</label>
            <input
              type="checkbox"
              id="considerCoffeeInput"
              {...register("considerCoffee")}
            />
          </div>

          <div>
            <label htmlFor="discoverdFromInput">Discovered From</label>
            <input
              type="text"
              id="discoverdFromInput"
              {...register("discoverdFrom", { required: true })}
            />
            {errors.discoverdFrom && <span>This field is required</span>}
          </div>

          <div>
            <label htmlFor="genderInput">Gender</label>
            <input
              type="text"
              id="genderInput"
              {...register("gender", { required: true })}
            />
            {errors.gender && <span>This field is required</span>}
          </div>

          <div>
            <label htmlFor="raceInput">Race</label>
            <input
              type="text"
              id="raceInput"
              {...register("race", { required: true })}
            />
            {errors.race && <span>This field is required</span>}
          </div>

          <div>
            <label htmlFor="emergencyContactNameInput">
              Emergency Contact Name
            </label>
            <input
              type="text"
              id="emergencyContactNameInput"
              {...register("emergencyContactName", { required: true })}
            />
            {errors.emergencyContactName && <span>This field is required</span>}
          </div>

          <div>
            <label htmlFor="emergencyContactPhoneInput">
              Emergency Contact Phone
            </label>
            <input
              type="text"
              id="emergencyContactPhoneInput"
              {...register("emergencyContactPhone", { required: true })}
            />
            {errors.emergencyContactPhone && (
              <span>This field is required</span>
            )}
          </div>

          <div>
            <label htmlFor="emergencyContactRelationInput">
              Emergency Contact Relation
            </label>
            <input
              type="text"
              id="emergencyContactRelationInput"
              {...register("emergencyContactRelation", { required: true })}
            />
            {errors.emergencyContactRelation && (
              <span>This field is required</span>
            )}
          </div>

          <div>
            <label htmlFor="agreeToMLHCodeOfConductInput">
              Agree to MLH Code of Conduct
            </label>
            <input
              type="checkbox"
              id="agreeToMLHCodeOfConductInput"
              {...register("agreeToMLHCodeOfConduct")}
            />
          </div>

          <div>
            <label htmlFor="agreeToMLHPrivacyPolicyInput">
              Agree to MLH Privacy Policy
            </label>
            <input
              type="checkbox"
              id="agreeToMLHPrivacyPolicyInput"
              {...register("agreeToMLHPrivacyPolicy")}
            />
          </div>

          <div>
            <label htmlFor="agreeToMLHCommunicationsInput">
              Agree to MLH Communications
            </label>
            <input
              type="checkbox"
              id="agreeToMLHCommunicationsInput"
              {...register("agreeToMLHCommunications")}
            />
          </div>

          <button type="submit">Submit</button>
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

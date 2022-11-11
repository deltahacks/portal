import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Background from "../components/Background";
import GradingNavBar from "../components/GradingNavBar";
import ThemeToggle from "../components/ThemeToggle";
import Applicant from "../components/Applicant";

const GradingPortal: NextPage = () => {
  const data = [
    {
      firstName: "John",
      lastName: "Doe",
      birthday: "2001-03-02",
      major: "Computer Science",
      willBeEnrolled: "true",
      graduationYear: "2024",
      degree: "Bachelor",
      currentLevel: "4",
      hackathonCount: "3",
      longAnswer1:
        "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Exercitationem earum cum nostrum distinctio repellat. Qui dolores natus sit, ipsum ipsa optio deleniti repellendus in! Adipisci tenetur dignissimos voluptatum voluptas id. Lorem ipsum dolor, sit amet consectetur adipisicing elit. Exercitationem earum cum nostrum distinctio repellat. Qui dolores natus sit, ipsum ipsa optio deleniti repellendus in! Adipisci tenetur dignissimos voluptatum voluptas id.",
      longAnswer2:
        "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Exercitationem earum cum nostrum distinctio repellat. Qui dolores natus sit, ipsum ipsa optio deleniti repellendus in! Adipisci tenetur dignissimos voluptatum voluptas id.",
      longAnswer3:
        "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Exercitationem earum cum nostrum distinctio repellat. Qui dolores natus sit, ipsum ipsa optio deleniti repellendus in! Adipisci tenetur dignissimos voluptatum voluptas id.Lorem ipsum dolor, sit amet consectetur adipisicing elit. Exercitationem earum cum nostrum distinctio repellat. Qui dolores natus sit, ipsum ipsa optio deleniti repellendus in!",
      socialLinks: "https://github.com/, https://www.linkedin.com/",
      resume:
        "https://www.gov.mb.ca/agriculture/industry-leadership/4h/pubs/foodpizzamem.pdf",
      extra:
        "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Aspernatur architecto praesentium sequi recusandae suscipit quaerat tempora ipsum inventore necessitatibus expedita! Necessitatibus laboriosam quaerat error quod esse totam, facilis quae dolorum?",
      tshirtSize: "Medium",
      hackerType: "Beginner",
      hasTeam: "true",
      workShop: "Lorem ipsum dolor sit amet consectetur",
      gender: "Male",
      considerSponserChat: "true",
      howDidYouHear: "Friend",
      background: "Asian",
      emergencyContactInfo: {
        firstName: "Jane",
        lastName: "Doe",
        phoneNumber: "(123)-456-7382",
        email: "hello.bye@gmail.com",
      },
      mlhAgreement: "true",
      mlhCoc: "true",
    },
    {
      firstName: "Jane",
      lastName: "Smith",
      birthday: "2001-03-02",
      major: "Computer Science",
      willBeEnrolled: "true",
      graduationYear: "2024",
      degree: "Bachelor",
      currentLevel: "4",
      hackathonCount: "3",
      longAnswer1:
        "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Exercitationem earum cum nostrum distinctio repellat. Qui dolores natus sit, ipsum ipsa optio deleniti repellendus in! Adipisci tenetur dignissimos voluptatum voluptas id. Lorem ipsum dolor, sit amet consectetur adipisicing elit. Exercitationem earum cum nostrum distinctio repellat. Qui dolores natus sit, ipsum ipsa optio deleniti repellendus in! Adipisci tenetur dignissimos voluptatum voluptas id.",
      longAnswer2:
        "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Exercitationem earum cum nostrum distinctio repellat. Qui dolores natus sit, ipsum ipsa optio deleniti repellendus in! Adipisci tenetur dignissimos voluptatum voluptas id.",
      longAnswer3:
        "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Exercitationem earum cum nostrum distinctio repellat. Qui dolores natus sit, ipsum ipsa optio deleniti repellendus in! Adipisci tenetur dignissimos voluptatum voluptas id.Lorem ipsum dolor, sit amet consectetur adipisicing elit. Exercitationem earum cum nostrum distinctio repellat. Qui dolores natus sit, ipsum ipsa optio deleniti repellendus in!",
      socialLinks: "https://github.com/, https://www.linkedin.com/",
      resume:
        "https://www.gov.mb.ca/agriculture/industry-leadership/4h/pubs/foodpizzamem.pdf",
      extra:
        "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Aspernatur architecto praesentium sequi recusandae suscipit quaerat tempora ipsum inventore necessitatibus expedita! Necessitatibus laboriosam quaerat error quod esse totam, facilis quae dolorum?",
      tshirtSize: "Medium",
      hackerType: "Beginner",
      hasTeam: "true",
      workShop:
        "Lorem ipsum dolor sit amet consectetur Lorem ipsum dolor sit amet consectetur",
      gender: "Male",
      considerSponserChat: "true",
      howDidYouHear: "Friend",
      background: "Asian",
      emergencyContactInfo: {
        firstName: "Jane",
        lastName: "Doe",
        phoneNumber: "(123)-456-7382",
        email: "hello.bye@gmail.com",
      },
      mlhAgreement: "true",
      mlhCoc: "true",
    },
  ];
  return (
    <>
      <Head>
        <title>Grading Portal</title>
      </Head>
      <div className="drawer drawer-end relative h-full min-h-screen w-full overflow-x-hidden font-montserrat">
        <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <GradingNavBar />
          <Background />
          <main className="px-7 py-16 sm:px-14 md:w-10/12 lg:pl-20 2xl:w-11/12 2xl:pt-20 mx-auto">
            <h1 className="text-2xl font-semibold leading-tight text-black dark:text-white sm:text-3xl lg:text-5xl 2xl:text-6xl">
              Applications
            </h1>
            <table className="my-6 w-full text-left">
              <thead className="bg-black">
                <tr>
                  <th className="border border-slate-600 p-3">First Name</th>
                  <th className="border border-slate-600 p-3">Last Name</th>
                  <th className="border border-slate-600 p-3">Judged By</th>
                  <th className="border border-slate-600 p-3">Score</th>
                  <th className="border border-slate-600 p-3">Submit Score</th>
                  <th className="border border-slate-600 p-3">
                    View Applicant
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <p className="p-3">Fetching Applicants...</p>
                ) : (
                  data.map((applicant, index) => (
                    <Applicant applicant={applicant} key={index} />
                  ))
                )}
              </tbody>
            </table>
          </main>
        </div>
        <div className="drawer-side md:hidden">
          <label
            htmlFor="my-drawer-3"
            className="drawer-overlay md:hidden"
          ></label>
          <div className="menu h-full w-80 flex-row content-between overflow-y-auto bg-white p-4 dark:bg-[#1F1F1F] md:hidden">
            <ul className="w-full">
              <li>
                <Link className="text-base font-bold" href="/dashboard">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link className="text-base font-bold" href="">
                  Review
                </Link>
              </li>
            </ul>
            <div className="mx-1 mb-2 flex w-full items-center justify-between">
              <ThemeToggle />
              <div>
                <button className="font-sub rounded bg-primary py-2.5 px-2.5 text-sm font-bold text-white">
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GradingPortal;

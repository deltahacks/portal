import google_logo from "../../public/images/google_logo.svg";
import github_logo from "../../public/images/github_logo.svg";
import discord_logo from "../../public/images/discord_logo.svg";
import { signIn } from "next-auth/react";
import Image from "next/image";

interface LoginProps {
  image: any;
  title: string;
  main: boolean;
}

const buttons = {
  GitHub: {
    image: github_logo,
    main: false,
  },
  Discord: {
    image: discord_logo,
    main: false,
  },
};

const LoginButton = (prop: LoginProps) => {
  const { title, image, main } = prop;
  const normalizedTitle = title.toLowerCase();
  const buttonStyling = main
    ? "align-items-center flex h-32 items-center justify-center rounded-lg bg-[#4F14EE] py-6 text-center text-xl font-medium"
    : "text-l flex items-center justify-center rounded-md border border-zinc-700 py-2 text-center font-medium hover:bg-zinc-700";
  const iconStyling = main
    ? "mr-4 aspect-square w-8"
    : "mr-2 aspect-square  w-4";
  return (
    <button className={buttonStyling} onClick={() => signIn(normalizedTitle)}>
      <div className={iconStyling}>
        <Image src={image} alt={`${title} Logo`} layout="responsive"></Image>
      </div>
      {title}
    </button>
  );
};

const LoginCard = () => {
  return (
    <div className=" absolute top-1/2 left-1/2 min-w-[85%] -translate-x-1/2 -translate-y-1/2 md:left-3/4 md:min-w-[40vw] ">
      <h2 className="mb-4 text-2xl font-bold text-black dark:text-white">
        Log In
      </h2>
      <div className="flex flex-col gap-1 rounded-xl border border-zinc-600 bg-zinc-800 p-4 text-white">
        <LoginButton
          key={"google"}
          title={"Sign in with Google"}
          image={google_logo}
          main={true}
        />
        <div className="my-2 flex items-center justify-center text-center text-sm text-zinc-600">
          <span className="h-0.5 w-full bg-zinc-600" />
          <div className="mx-2 whitespace-nowrap">Or Continue With</div>
          <span className="h-0.5 w-full bg-zinc-600" />
        </div>
        {Object.entries(buttons).map(([key, value]) =>
          value.main ? null : (
            <LoginButton
              key={key}
              title={key}
              image={value.image}
              main={value.main}
            />
          )
        )}
      </div>
    </div>
  );
};

export default LoginCard;

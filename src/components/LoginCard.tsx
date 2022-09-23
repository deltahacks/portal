import google_icon from "../../public/images/google_icon.svg";
import github_logo from "../../public/images/github_logo.svg";
import discord_logo from "../../public/images/discord_logo.svg";
import { signIn } from "next-auth/react";
import Image from "next/image";

interface LoginProps {
  image: any;
  title: string;
}

const buttons = {
  GitHub: {
    image: github_logo,
  },
  Discord: {
    image: discord_logo,
  },
};

const LoginButton = (prop: LoginProps) => {
  const { title, image } = prop;
  const normalizedTitle = title.toLowerCase();
  return (
    <button
      className="text-l flex items-center justify-center rounded-md border border-zinc-700 py-2 text-center font-medium hover:bg-zinc-700"
      onClick={() => signIn(normalizedTitle)}
    >
      <div className="mr-2 aspect-square  w-4">
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
        <button
          className="align-items-center flex h-32 items-center justify-center rounded-lg bg-[#4F14EE] py-6 text-center text-xl font-medium"
          onClick={() => signIn("google")}
        >
          <div className="mr-4 aspect-square w-8">
            <Image
              src={google_icon}
              alt="Google Login Icon"
              layout="responsive"
            ></Image>
          </div>
          <div className="whitespace-nowrap md:text-lg">
            Sign in with Google
          </div>
        </button>
        <div className="my-2 flex items-center justify-center text-center text-sm text-zinc-600">
          <span className="h-0.5 w-full bg-zinc-600" />
          <div className="mx-2 whitespace-nowrap">Or Continue With</div>
          <span className="h-0.5 w-full bg-zinc-600" />
        </div>
        {Object.entries(buttons).map(([key, value]) => (
          <LoginButton key={key} title={key} image={value.image} />
        ))}
      </div>
    </div>
  );
};

export default LoginCard;

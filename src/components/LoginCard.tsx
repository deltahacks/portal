import google_logo from "../../public/images/google_logo.svg";
import { signIn } from "next-auth/react";
import Image from "next/image";

interface LoginProps {
  image?: HTMLImageElement;
  title: string;
  main: boolean;
  Icon?: () => JSX.Element;
}

interface ButtonData {
  main: boolean;
  title: string;
  Icon: () => JSX.Element;
}

const GithubIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7.5 0C3.35625 0 0 3.35625 0 7.5C0 10.8187 2.14687 13.6219 5.12812 14.6156C5.50312 14.6813 5.64375 14.4563 5.64375 14.2594C5.64375 14.0813 5.63438 13.4906 5.63438 12.8625C3.75 13.2094 3.2625 12.4031 3.1125 11.9813C3.02813 11.7656 2.6625 11.1 2.34375 10.9219C2.08125 10.7813 1.70625 10.4344 2.33437 10.425C2.925 10.4156 3.34687 10.9687 3.4875 11.1937C4.1625 12.3281 5.24062 12.0094 5.67187 11.8125C5.7375 11.325 5.93438 10.9969 6.15 10.8094C4.48125 10.6219 2.7375 9.975 2.7375 7.10625C2.7375 6.29062 3.02813 5.61563 3.50625 5.09063C3.43125 4.90313 3.16875 4.13438 3.58125 3.10313C3.58125 3.10313 4.20937 2.90625 5.64375 3.87188C6.24375 3.70313 6.88125 3.61875 7.51875 3.61875C8.15625 3.61875 8.79375 3.70313 9.39375 3.87188C10.8281 2.89688 11.4562 3.10313 11.4562 3.10313C11.8687 4.13438 11.6063 4.90313 11.5313 5.09063C12.0094 5.61563 12.3 6.28125 12.3 7.10625C12.3 9.98437 10.5469 10.6219 8.87812 10.8094C9.15 11.0438 9.38438 11.4937 9.38438 12.1969C9.38438 13.2 9.375 14.0063 9.375 14.2594C9.375 14.4563 9.51562 14.6906 9.89062 14.6156C11.3795 14.113 12.6732 13.1561 13.5898 11.8796C14.5063 10.6032 14.9996 9.07143 15 7.5C15 3.35625 11.6438 0 7.5 0Z"
      fill="currentColor"
    />
  </svg>
);

const DiscordIcon = () => (
  <svg
    width="16"
    height="13"
    viewBox="0 0 16 13"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13.1982 1.80748C12.2419 1.37623 11.2169 1.05748 10.1451 0.876234C10.1355 0.874401 10.1256 0.875582 10.1168 0.879613C10.1079 0.883644 10.1006 0.890326 10.0957 0.898734C9.96443 1.12936 9.81818 1.42998 9.71568 1.66748C8.57887 1.49763 7.42312 1.49763 6.28631 1.66748C6.17214 1.40427 6.0434 1.14762 5.90068 0.898734C5.89584 0.890223 5.88853 0.88339 5.8797 0.879146C5.87088 0.874903 5.86098 0.87345 5.85131 0.874983C4.78006 1.05623 3.75506 1.37498 2.79818 1.80686C2.78995 1.81031 2.78297 1.8162 2.77818 1.82373C0.833181 4.68311 0.300056 7.47186 0.561931 10.2256C0.56266 10.2324 0.564753 10.2389 0.568084 10.2448C0.571415 10.2507 0.575914 10.2559 0.581306 10.26C1.71655 11.0865 2.98277 11.7161 4.32693 12.1225C4.3363 12.1254 4.34632 12.1254 4.35569 12.1225C4.36506 12.1196 4.37333 12.1139 4.37943 12.1062C4.66868 11.7194 4.92499 11.309 5.14568 10.8794C5.14875 10.8735 5.15051 10.867 5.15086 10.8604C5.15121 10.8538 5.15013 10.8472 5.1477 10.841C5.14527 10.8348 5.14154 10.8293 5.13677 10.8247C5.13201 10.8201 5.1263 10.8166 5.12006 10.8144C4.71631 10.6623 4.32511 10.4788 3.95006 10.2656C3.94332 10.2618 3.93764 10.2563 3.93353 10.2497C3.92942 10.2431 3.92701 10.2356 3.92651 10.2279C3.92602 10.2201 3.92745 10.2124 3.93069 10.2053C3.93393 10.1983 3.93886 10.1922 3.94506 10.1875C4.02381 10.1294 4.10256 10.0687 4.17756 10.0081C4.18431 10.0027 4.19244 9.99918 4.20105 9.99808C4.20965 9.99698 4.2184 9.99829 4.22631 10.0019C6.68068 11.1044 9.33881 11.1044 11.7644 10.0019C11.7724 9.99807 11.7812 9.99659 11.7899 9.99759C11.7987 9.99858 11.8069 10.002 11.8138 10.0075C11.8888 10.0687 11.9669 10.1294 12.0463 10.1875C12.0526 10.1921 12.0576 10.1981 12.0609 10.2051C12.0643 10.2121 12.0658 10.2198 12.0654 10.2276C12.0651 10.2353 12.0628 10.2428 12.0588 10.2495C12.0548 10.2561 12.0492 10.2617 12.0426 10.2656C11.6688 10.4806 11.2801 10.6625 10.8719 10.8137C10.8657 10.816 10.86 10.8196 10.8552 10.8243C10.8504 10.8289 10.8467 10.8345 10.8443 10.8407C10.8418 10.847 10.8408 10.8536 10.8411 10.8603C10.8415 10.8669 10.8432 10.8734 10.8463 10.8794C11.0713 11.3087 11.3288 11.7175 11.6119 12.1056C11.6178 12.1136 11.626 12.1195 11.6354 12.1227C11.6448 12.1258 11.6549 12.1259 11.6644 12.1231C13.0109 11.7179 14.2792 11.088 15.4157 10.26C15.4212 10.2561 15.4259 10.2511 15.4293 10.2453C15.4328 10.2394 15.4349 10.233 15.4357 10.2262C15.7482 7.04248 14.9119 4.27623 13.2176 1.82498C13.2134 1.81702 13.2065 1.81081 13.1982 1.80748ZM5.51256 8.54873C4.77381 8.54873 4.16443 7.88061 4.16443 7.06123C4.16443 6.24123 4.76193 5.57373 5.51256 5.57373C6.26881 5.57373 6.87256 6.24686 6.86068 7.06123C6.86068 7.88123 6.26318 8.54873 5.51256 8.54873ZM10.4969 8.54873C9.75756 8.54873 9.14881 7.88061 9.14881 7.06123C9.14881 6.24123 9.74568 5.57373 10.4969 5.57373C11.2532 5.57373 11.8569 6.24686 11.8451 7.06123C11.8451 7.88123 11.2538 8.54873 10.4969 8.54873Z"
      fill="currentColor"
    />
  </svg>
);

const LinkedinIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    preserveAspectRatio="xMidYMid meet"
    viewBox="0 0 24 24"
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M1 2.838A1.838 1.838 0 0 1 2.838 1H21.16A1.837 1.837 0 0 1 23 2.838V21.16A1.838 1.838 0 0 1 21.161 23H2.838A1.838 1.838 0 0 1 1 21.161V2.838Zm8.708 6.55h2.979v1.496c.43-.86 1.53-1.634 3.183-1.634c3.169 0 3.92 1.713 3.92 4.856v5.822h-3.207v-5.106c0-1.79-.43-2.8-1.522-2.8c-1.515 0-2.145 1.089-2.145 2.8v5.106H9.708V9.388Zm-5.5 10.403h3.208V9.25H4.208v10.54ZM7.875 5.812a2.063 2.063 0 1 1-4.125 0a2.063 2.063 0 0 1 4.125 0Z"
      clipRule="evenodd"
    />
  </svg>
);

const buttons: ButtonData[] = [
  {
    title: "GitHub",
    main: false,
    Icon: GithubIcon,
  },
  {
    title: "Discord",
    main: false,
    Icon: DiscordIcon,
  },
  {
    title: "Linkedin",
    main: false,
    Icon: LinkedinIcon,
  },
];

const LoginButton = (prop: LoginProps) => {
  const { title, image, main, Icon } = prop;

  const iconExists = Icon === undefined;
  const normalizedTitle = title.toLowerCase();
  const buttonStyling = main
    ? "align-items-center flex gap-4 h-32 items-center justify-center rounded-lg bg-primary py-6 text-center text-xl font-medium"
    : "text-black dark:text-white text-lg flex items-center justify-center gap-2 rounded-md border border-zinc-700 py-2 text-center font-medium hover:bg-[#dedede] dark:hover:bg-zinc-700";
  const iconStyling = main ? "aspect-square w-8" : "w-5 dark:text-white";
  return (
    <button className={buttonStyling} onClick={() => signIn(normalizedTitle)}>
      <div className={iconStyling}>
        {image !== undefined ? (
          <Image src={image} alt={`${title} Logo`} layout="responsive"></Image>
        ) : iconExists ? null : (
          <Icon />
        )}
      </div>
      {main ? `Sign in with ${title}` : title}
    </button>
  );
};

interface LoginCardProps {
  errorMsg?: string;
}

const LoginCard: React.FC<LoginCardProps> = (props) => {
  return (
    <div className="absolute top-1/2 left-1/2 min-w-[85%] -translate-x-1/2 -translate-y-1/2 md:left-3/4 md:min-w-[40vw] ">
      <h2 className="mb-4 text-2xl font-bold text-black dark:text-white">
        Log In
      </h2>
      {props.errorMsg ? (
        <p className="pb-4 font-semibold text-red-500"> {props.errorMsg}</p>
      ) : null}
      <div className="flex flex-col gap-1 rounded-xl border border-zinc-600 bg-white p-4 text-white dark:bg-zinc-800">
        <LoginButton
          key={"google"}
          title={"Google"}
          image={google_logo}
          main={true}
        />
        <div className="my-2 flex items-center justify-center text-center text-sm text-zinc-600">
          <span className="h-0.5 w-full bg-zinc-600" />
          <div className="mx-2 whitespace-nowrap">Or Continue With</div>
          <span className="h-0.5 w-full bg-zinc-600" />
        </div>
        {buttons.map((data) => {
          return <LoginButton key={data.title} {...data} />;
        })}
      </div>
    </div>
  );
};

export default LoginCard;

import Image from "next/image";

const SocialButtons = () => {
  return (
    <div className=" flex gap-x-2.5 md:flex-col">
      <a
        href="https://www.instagram.com/deltahacks/"
        className="invert filter hover:brightness-150 dark:invert-0"
      >
        <SocialIcon src="/Instagram.svg" alt="Instgram.png" />
      </a>
      <a
        href="https://www.facebook.com/thedeltahacks/"
        className="invert filter hover:brightness-150 dark:invert-0"
      >
        <SocialIcon src="/Facebook.svg" alt="Facebook.png" />
      </a>
      <a
        href="https://twitter.com/deltahacks"
        className="invert filter hover:brightness-150 dark:invert-0"
      >
        <SocialIcon src="/Twitter.svg" alt="Twitter.png" />
      </a>
      <a
        href="https://www.linkedin.com/company/deltahacks/"
        className="invert filter hover:brightness-150 dark:invert-0"
      >
        <SocialIcon src="/LinkedIn.svg" alt="LinkedIn.png" />
      </a>
    </div>
  );
};

type SocialIconProps = {
  src: string;
  alt: string;
};

function SocialIcon({ src, alt }: SocialIconProps) {
  return <Image src={src} alt={alt} width="41px" height="41px" />;
}

export default SocialButtons;

import Image from 'next/image'


export default function SocialButtons() {
    return (
        <div className="flex gap-x-2.5 md:grid md:auto-cols-max md:gap-y-2.5">
            <a href="https://www.instagram.com/deltahacks/" className="filter hover:brightness-150">
                <SocialIcon src="/Instagram.png" alt="Instgram.png"/>
            </a>            
            <a href="https://www.facebook.com/thedeltahacks/" className="filter hover:brightness-150">
                <SocialIcon src="/Facebook.png" alt="Facebook.png"/>
            </a>
            <a href="https://twitter.com/deltahacks" className="filter hover:brightness-150">
                <SocialIcon src="/Twitter.png" alt="Twitter.png"/>
            </a>
            <a href="https://www.linkedin.com/company/deltahacks/" className="filter hover:brightness-150">
                <SocialIcon src="/LinkedIn.png" alt="LinkedIn.png"/>
            </a>
        </div>
    )
}

type SocialIconProps = {
    src: string
    alt: string
}

function SocialIcon({ src, alt }: SocialIconProps) {
    return (
        <Image
            src={src}
            alt={alt}
            width="41px"
            height="41px"
        />
    )
}


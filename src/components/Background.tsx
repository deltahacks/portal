import { cn } from "../utils/mergeTailwind";

const Background = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "absolute inset-0 -z-10 h-full w-full overflow-hidden bg-[#eaeaea] dark:bg-[#171717]",
        className
      )}
    >
      <div className="pointer-events-none light-gradient dark:dark-gradient absolute inset-0 -left-[50%] -top-[50%] h-[200%] w-[200%] -rotate-12 animate-slow-bg" />
    </div>
  );
};

export default Background;

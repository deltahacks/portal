const Background = () => {
  return (
    <div className="absolute inset-0 -z-10 h-full w-full overflow-hidden bg-[#eeeeee] dark:bg-[#171717]">
      <div className="light-gradient dark:dark-gradient absolute inset-0 -left-[50%] -top-[50%] h-[200%] w-[200%] -rotate-12"></div>
    </div>
  );
};

export default Background;

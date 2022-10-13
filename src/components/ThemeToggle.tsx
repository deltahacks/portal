import { useTheme } from "next-themes";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => {
        setTheme(theme === "light" ? "dark" : "light");
      }}
    >
      <span className="block dark:hidden">
        <img src="/images/bxs_moon.svg" />
      </span>
      <span className="hidden dark:block">
        <img src="/images/bxs_sun.svg" />
      </span>
    </button>
  );
};

export default ThemeToggle;

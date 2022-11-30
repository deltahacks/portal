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
        <picture>
          <img src="/images/bxs_moon.svg" alt="moon" />
        </picture>
      </span>
      <span className="hidden dark:block">
        <picture>
          <img src="/images/bxs_sun.svg" alt="sun" />
        </picture>
      </span>
    </button>
  );
};

export default ThemeToggle;

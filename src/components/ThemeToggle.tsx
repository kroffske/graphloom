
import React from "react";

const ThemeToggle = () => {
  const [dark, setDark] = React.useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  React.useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  return (
    <button
      className="ml-auto px-2 py-1 text-sm rounded bg-primary/10 hover:bg-primary/30 text-primary font-medium border border-primary/30 transition-colors"
      aria-pressed={dark}
      onClick={() => setDark((d) => !d)}
    >
      {dark ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
};

export default ThemeToggle;

'use client'

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"

const ThemeContext = createContext({
  theme: "light" as Theme,
  setTheme: (theme: Theme) => {},
})

export function ThemeProvider({
  children,
  initialTheme,
}: {
  children: React.ReactNode
  initialTheme: Theme
}) {
  const [theme, setTheme] = useState<Theme>(initialTheme)

  // Apply theme instantly
  useEffect(() => {
    const root = document.documentElement

    if (theme === "dark") {
  // Primary background / page
  root.style.setProperty("--primary-background-color", "#0a0a0a");    // true black
  root.style.setProperty("--primary-text-color", "#fefefe");          // pure white

  // Secondary background / cards / panels
  root.style.setProperty("--secondary-background-color", "#1c1c1c");  // dark slate
  root.style.setProperty("--secondary-text-color", "#dcdcdc");        // soft white text

  // Accent / highlights / buttons / hover
  root.style.setProperty("--third-background-color", "#ffc300");      // bright yellow
  root.style.setProperty("--third-text-color", "#0a0a0a");            // black on yellow

  // Borders / lines
  root.style.setProperty("--border-theme-color", "#333333");

  // Loader or overlay background
  root.style.setProperty("--loader-wrapper-bg-color", "rgba(0,0,0,0.8)");

} else if (theme === "light") {
  // Primary background / page
  root.style.setProperty("--primary-background-color", "#ffffff");    // clean white
  root.style.setProperty("--primary-text-color", "#0a0a0a");          // true black

  // Secondary background / cards / panels
  root.style.setProperty("--secondary-background-color", "#fdf5e6");  // very light cream (soft)
  root.style.setProperty("--secondary-text-color", "#1a1a1a");        // dark gray/black

  // Accent / highlights / buttons / hover
  root.style.setProperty("--third-background-color", "#ffc300");      // bright yellow
  root.style.setProperty("--third-text-color", "#0a0a0a");            // black on yellow

  // Borders / lines
  root.style.setProperty("--border-theme-color", "#e5e5e5");          // soft gray

  // Loader or overlay background
  root.style.setProperty("--loader-wrapper-bg-color", "rgba(255,255,255,0.9)");

} else {
  // fallback: same as light
  root.style.setProperty("--primary-background-color", "#ffffff");
  root.style.setProperty("--primary-text-color", "#0a0a0a");
  root.style.setProperty("--secondary-background-color", "#fdf5e6");
  root.style.setProperty("--secondary-text-color", "#1a1a1a");
  root.style.setProperty("--third-background-color", "#ffc300");
  root.style.setProperty("--third-text-color", "#0a0a0a");
  root.style.setProperty("--border-theme-color", "#e5e5e5");
  root.style.setProperty("--loader-wrapper-bg-color", "rgba(255,255,255,0.9)");
}

    localStorage.setItem("theme", theme)
  }, [theme])

  // Restore from localStorage (instant UX)
  useEffect(() => {
    const saved = localStorage.getItem("theme") as Theme
    if (saved && saved !== theme) {
      setTheme(saved)
    }
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
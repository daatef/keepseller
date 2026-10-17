


// :root {
//   --primary-background-color: #fff;    
//   --primary-text-color: #000;            
//   --secondary-background-color: #fff;  
//   --secondary-text-color: #000;
// --third-background-color: #7dff4a !important;
//   --third-text-color: #000 !important; 


//   --web-primary-background-color: #000000;    
//   --web-primary-text-color: #ffffff;            
//   --web-secondary-background-color: #000000;     
//   --web-secondary-text-color: #ffffff;
//   --web-third-background-color: #7dff4a;
//   --web-third-text-color: #000;

 

//   --primary-chart-color: #7dff4a !important;
//   --primary-light-color: #7dff4a !important;
//   --primary-chart-bar-color: #7dff4a !important;
//   --sell-command-popover-width: 500px;

//   --sale-item-bg: #dddddd;
// }




    'use client'

import { useState, useEffect } from "react"
import { Settings } from "lucide-react"

export default function ThemeSelector() {
  const [theme, setTheme] = useState("light")

  // Load saved theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme)
    }
  }, [])

  // Apply theme and save to localStorage
  useEffect(() => {
    const root = document.documentElement
    if (theme === "dark") {
      root.style.setProperty("--primary-background-color", "#000")
      root.style.setProperty("--primary-text-color", "#fff")
      root.style.setProperty("--secondary-background-color", "#000")
      root.style.setProperty("--secondary-text-color", "#fff")
      root.style.setProperty("--third-background-color", "#000")
      root.style.setProperty("--third-text-color", "#7dff4a")
    } else {
      root.style.setProperty("--primary-background-color", "#fff")
      root.style.setProperty("--primary-text-color", "#000")
      root.style.setProperty("--secondary-background-color", "#fff")
      root.style.setProperty("--secondary-text-color", "#000")
      root.style.setProperty("--third-background-color", "#7dff4a")
      root.style.setProperty("--third-text-color", "#000")
    }

    // Save the theme
    localStorage.setItem("theme", theme)
  }, [theme])

  return (
    <div className="flex flex-col md:flex-row md:items-center md:gap-6 gap-3">
      <label className="w-48 text-gray-700 font-semibold flex items-center gap-2">
        <Settings className="w-5 h-5" />
        Theme:
      </label>
      <select
        className="flex-1 border rounded-md px-3 py-2 shadow-sm"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  )
}
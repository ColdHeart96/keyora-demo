"use client";
import { useEffect } from "react";
import { useTheme } from "next-themes";

export function ThemeSyncer() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (resolvedTheme === "dark") {
      document.documentElement.style.setProperty('--chat--input--color', '#fff');
      document.documentElement.style.setProperty('--chat--input--background', '#18181b');
    } else {
      document.documentElement.style.setProperty('--chat--input--color', '#111');
      document.documentElement.style.setProperty('--chat--input--background', '#fff');
    }
  }, [resolvedTheme]);

  return null;
} 
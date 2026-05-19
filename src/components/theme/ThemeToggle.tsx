"use client";
import { Moon, Sun } from "lucide-react";
import { IconButton } from "@/ui/icon-button";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { resolved, setTheme } = useTheme();
  const next = resolved === "dark" ? "light" : "dark";
  return (
    <IconButton
      label={`Chuyển sang chế độ ${next === "dark" ? "tối" : "sáng"}`}
      variant="ghost"
      size="md"
      onClick={() => setTheme(next)}
    >
      {resolved === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </IconButton>
  );
}

export const ThemeNoFlashScript = () => (
  <script
    dangerouslySetInnerHTML={{
      __html: `(() => {
        try {
          const t = localStorage.getItem('map-vn:theme') || 'system';
          const sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          const r = t === 'system' ? sys : t;
          document.documentElement.setAttribute('data-theme', r);
          document.documentElement.style.colorScheme = r;
        } catch (_) {}
      })();`,
    }}
  />
);

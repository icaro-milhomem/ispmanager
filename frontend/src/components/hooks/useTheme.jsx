import { useState, useEffect } from "react";

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    // Verificar se há um tema salvo no localStorage
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      
      // Se o usuário definiu um tema, use-o
      if (savedTheme) {
        return savedTheme;
      }
      
      // Se o usuário não definiu, verifique a preferência do sistema
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      return prefersDark ? "dark" : "light";
    }
    
    // Padrão é light
    return "light";
  });

  useEffect(() => {
    // Salvar a preferência do usuário
    localStorage.setItem("theme", theme);
    
    // Aplicar a classe no elemento HTML
    const root = window.document.documentElement;
    
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return { theme, setTheme };
}
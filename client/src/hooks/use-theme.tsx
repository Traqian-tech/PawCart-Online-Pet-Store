import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface ThemeContextType {
  themeColor: string;
  setThemeColor: (color: string) => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'meow_theme_color';
const DEFAULT_THEME_COLOR = 'hsl(138, 55%, 32%)'; // Default green

// Preset theme colors
export const PRESET_THEME_COLORS = [
  { name: 'Green (Default)', value: 'hsl(138, 55%, 32%)', hex: '#26732D' },
  { name: 'Blue', value: 'hsl(210, 100%, 55%)', hex: '#3399FF' },
  { name: 'Purple', value: 'hsl(270, 70%, 60%)', hex: '#8B5CF6' },
  { name: 'Pink', value: 'hsl(340, 82%, 65%)', hex: '#EF5A9C' },
  { name: 'Orange', value: 'hsl(25, 95%, 53%)', hex: '#F77728' },
  { name: 'Red', value: 'hsl(4, 90%, 58%)', hex: '#F04438' },
  { name: 'Cyan', value: 'hsl(180, 70%, 50%)', hex: '#0D9488' },
  { name: 'Indigo', value: 'hsl(240, 70%, 60%)', hex: '#6366F1' },
];

// Convert HSL color to RGB
function hslToRgb(hsl: string): { r: number; g: number; b: number } | null {
  const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return null;

  const h = parseInt(match[1]) / 360;
  const s = parseInt(match[2]) / 100;
  const l = parseInt(match[3]) / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

// Update CSS variables
function updateThemeVariables(color: string) {
  const root = document.documentElement;
  
  // Parse HSL color
  const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return;

  const h = parseInt(match[1]);
  const s = parseInt(match[2]);
  const l = parseInt(match[3]);

  // Calculate theme color variants
  const lightS = Math.max(s - 5, 0);
  const darkS = Math.min(s + 5, 100);
  const lightL = Math.min(l + 13, 100);
  const darkL = Math.max(l - 7, 0);
  const hoverL = Math.max(l - 4, 0);
  const paleL = 95;

  // Update CSS variables
  root.style.setProperty('--meow-green', color);
  root.style.setProperty('--meow-green-dark', `hsl(${h}, ${darkS}%, ${darkL}%)`);
  root.style.setProperty('--meow-green-light', `hsl(${h}, ${lightS}%, ${lightL}%)`);
  root.style.setProperty('--meow-green-pale', `hsl(${h}, ${Math.max(s - 15, 0)}%, ${paleL}%)`);
  root.style.setProperty('--meow-green-hover', `hsl(${h}, ${Math.min(s + 3, 100)}%, ${hoverL}%)`);

  // Update accent color (for shadcn components)
  root.style.setProperty('--accent', color);
  
  // Update shadow color (using RGB values)
  const rgb = hslToRgb(color);
  if (rgb) {
    root.style.setProperty('--shadow-brand', `0 8px 20px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.18)`);
    root.style.setProperty('--shadow-brand-lg', `0 12px 28px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.22)`);
    root.style.setProperty('--shadow-glow-green', `0 0 24px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeColor, setThemeColorState] = useState<string>(DEFAULT_THEME_COLOR);

  useEffect(() => {
    // Load saved theme color from localStorage
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme) {
      setThemeColorState(savedTheme);
      updateThemeVariables(savedTheme);
    } else {
      updateThemeVariables(DEFAULT_THEME_COLOR);
    }
  }, []);

  const setThemeColor = (color: string) => {
    setThemeColorState(color);
    localStorage.setItem(THEME_STORAGE_KEY, color);
    updateThemeVariables(color);
  };

  const resetTheme = () => {
    setThemeColorState(DEFAULT_THEME_COLOR);
    localStorage.removeItem(THEME_STORAGE_KEY);
    updateThemeVariables(DEFAULT_THEME_COLOR);
  };

  return (
    <ThemeContext.Provider value={{ themeColor, setThemeColor, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}


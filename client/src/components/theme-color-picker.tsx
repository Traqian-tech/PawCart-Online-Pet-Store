import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme, PRESET_THEME_COLORS } from '@/hooks/use-theme';
import { Palette, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ThemeColorPicker() {
  const { themeColor, setThemeColor, resetTheme } = useTheme();
  const { toast } = useToast();
  const [customColor, setCustomColor] = useState('#26732D');

  // Convert HSL to hexadecimal (for color picker)
  const hslToHex = (hsl: string): string => {
    const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!match) return '#26732D';

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

    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Convert hexadecimal to HSL
  const hexToHsl = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    h = Math.round(h * 360);
    s = Math.round(s * 100);
    const lightness = Math.round(l * 100);

    return `hsl(${h}, ${s}%, ${lightness}%)`;
  };

  const handlePresetColorSelect = (color: string) => {
    setThemeColor(color);
    toast({
      title: 'Theme Color Updated',
      description: 'Your personalized theme color has been applied',
    });
  };

  const handleCustomColorChange = (hex: string) => {
    setCustomColor(hex);
    const hsl = hexToHsl(hex);
    setThemeColor(hsl);
    toast({
      title: 'Custom Color Applied',
      description: 'Your custom theme color has been updated',
    });
  };

  const handleReset = () => {
    resetTheme();
    setCustomColor('#26732D');
    toast({
      title: 'Reset to Default Color',
      description: 'Theme color has been restored to default green',
    });
  };

  const currentHex = hslToHex(themeColor);

  return (
    <Card className="p-6 bg-gradient-to-br from-white via-gray-50/50 to-white border-gray-200 shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-xl">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-md">
            <Palette className="h-5 w-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Theme Color Settings
          </span>
        </CardTitle>
        <CardDescription className="text-sm text-gray-600 mt-2">
          Choose your favorite theme color to personalize your shopping experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preset Colors */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Preset Colors</h3>
          <div className="grid grid-cols-4 sm:grid-cols-4 gap-3">
            {PRESET_THEME_COLORS.map((preset) => {
              const isSelected = preset.value === themeColor;
              return (
                <button
                  key={preset.value}
                  onClick={() => handlePresetColorSelect(preset.value)}
                  className={`
                    relative group flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all
                    ${isSelected 
                      ? 'border-gray-800 shadow-lg scale-105' 
                      : 'border-gray-200 hover:border-gray-400 hover:shadow-md'
                    }
                  `}
                  style={{
                    backgroundColor: isSelected ? `${preset.hex}15` : 'transparent',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full shadow-md transition-transform group-hover:scale-110"
                    style={{ backgroundColor: preset.hex }}
                  />
                  <span className="text-xs mt-2 text-gray-700 font-medium text-center">
                    {preset.name.split(' ')[0]}
                  </span>
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-800 rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Color */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Custom Color</h3>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="color"
                value={currentHex}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                className="w-full h-12 rounded-lg cursor-pointer border-2 border-gray-200 hover:border-gray-400 transition-colors"
              />
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-xs text-gray-600 font-medium">Current Color</span>
              <div
                className="w-12 h-12 rounded-lg shadow-md border-2 border-gray-200"
                style={{ backgroundColor: currentHex }}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Click the color picker to choose any color you like
          </p>
        </div>

        {/* Reset Button */}
        <div className="pt-4 border-t border-gray-200">
          <Button
            onClick={handleReset}
            variant="outline"
            className="w-full hover:bg-gray-50"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Default Color
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


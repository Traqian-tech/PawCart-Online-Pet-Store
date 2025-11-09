import { useState } from 'react';
import { Globe, DollarSign, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/language-context';
import { useCurrency } from '@/contexts/currency-context';

export function LanguageCurrencySwitcher() {
  const { language, setLanguage, languageNames } = useLanguage();
  const { currency, setCurrency, currencies } = useCurrency();

  return (
    <div className="flex items-center gap-2">
      {/* Language Switcher - Hidden (English only) */}
      
      {/* Currency Switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-white hover:text-yellow-300 hover:bg-[#2d4f31] transition-colors px-2 py-1 h-auto"
          >
            <DollarSign size={14} className="mr-1" />
            <span className="text-xs font-medium">{currencies[currency]?.symbol} {currency}</span>
            <ChevronDown size={12} className="ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 max-h-96 overflow-y-auto bg-white z-[9999]">
          <DropdownMenuLabel className="text-xs text-gray-700 font-semibold">Currency</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {Object.entries(currencies).map(([code, info]) => (
            <DropdownMenuItem
              key={code}
              onClick={() => setCurrency(code as any)}
              className={`text-sm cursor-pointer text-gray-900 hover:bg-gray-100 ${
                currency === code ? 'bg-gray-100 font-semibold' : ''
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div>
                  <div className={currency === code ? 'text-[#26732d] font-bold' : 'text-gray-900'}>
                    {info.symbol} {info.code}
                  </div>
                  <div className="text-xs text-gray-500">{info.name}</div>
                </div>
                {currency === code && (
                  <span className="ml-2 text-[#26732d] font-bold">✓</span>
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Mobile version - more compact
export function MobileLanguageCurrencySwitcher() {
  const { language, setLanguage, languageNames } = useLanguage();
  const { currency, setCurrency, currencies } = useCurrency();

  return (
    <div className="flex items-center gap-1">
      {/* Language Switcher - Mobile - Hidden (English only) */}
      
      {/* Currency Switcher - Mobile */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-white hover:text-yellow-300 hover:bg-[#2d4f31] transition-colors px-1.5 py-0.5 h-auto"
          >
            <span className="text-[10px] font-medium">{currencies[currency]?.symbol}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 max-h-80 overflow-y-auto bg-white z-[9999]">
          <DropdownMenuLabel className="text-xs text-gray-700 font-semibold">Currency</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {Object.entries(currencies).map(([code, info]) => (
            <DropdownMenuItem
              key={code}
              onClick={() => setCurrency(code as any)}
              className={`text-xs cursor-pointer text-gray-900 hover:bg-gray-100 ${
                currency === code ? 'bg-gray-100 font-semibold' : ''
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div>
                  <div className={currency === code ? 'text-[#26732d] font-bold' : 'text-gray-900'}>
                    {info.symbol} {info.code}
                  </div>
                </div>
                {currency === code && (
                  <span className="ml-2 text-[#26732d] font-bold">✓</span>
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}


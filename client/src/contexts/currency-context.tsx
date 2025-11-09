import { createContext, useContext, useState, ReactNode } from 'react';

type Currency = 'HKD' | 'USD' | 'EUR' | 'GBP' | 'CNY';

interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name: string;
  rate: number; // Exchange rate relative to USD (base currency)
}

const currencies: Record<Currency, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1 }, // Base currency
  HKD: { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', rate: 7.81 }, // 1 USD ≈ 7.81 HKD
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.93 }, // 1 USD ≈ 0.93 EUR
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79 }, // 1 USD ≈ 0.79 GBP
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', rate: 7.25 }, // 1 USD ≈ 7.25 CNY
};

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (curr: Currency) => void;
  convert: (amount: number) => number;
  format: (amount: number, showSymbol?: boolean) => string;
  currencyInfo: CurrencyInfo;
  currencies: typeof currencies;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem('currency') as Currency;
    // Check if saved currency is valid, otherwise default to USD
    if (saved && currencies[saved]) {
      return saved;
    }
    // If invalid currency, clear it and use USD (US Dollar)
    localStorage.setItem('currency', 'USD');
    return 'USD';
  });

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    localStorage.setItem('currency', curr);
  };

  const convert = (amount: number): number => {
    if (typeof amount === 'string') {
      amount = parseFloat(amount);
    }
    if (isNaN(amount)) return 0;
    
    // Safety check: if currency is invalid, use USD
    const currentCurrency = currencies[currency] ? currency : 'USD';
    
    // Prices in database are stored in USD (base currency)
    // Convert from USD to target currency
    const convertedAmount = amount * currencies[currentCurrency].rate;
    return convertedAmount;
  };

  const format = (amount: number, showSymbol: boolean = true): string => {
    const converted = convert(amount);
    // Safety check: if currency is invalid, use USD
    const currentCurrency = currencies[currency] ? currency : 'USD';
    const currencyInfo = currencies[currentCurrency];
    
    // Format number with appropriate decimal places
    let formatted: string;
    // All currencies use 2 decimal places for consistency
    formatted = converted.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    return showSymbol ? `${currencyInfo.symbol}${formatted}` : formatted;
  };

  const currencyInfo = currencies[currency] || currencies['USD'];

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      setCurrency, 
      convert, 
      format, 
      currencyInfo,
      currencies 
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
}


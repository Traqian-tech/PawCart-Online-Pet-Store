# 🌐 Language & Currency Switching Guide

## Overview

The MeowMeow PetShop now supports **multi-language** and **multi-currency** functionality, allowing users to view the website in their preferred language and currency.

---

## ✨ Features Implemented

### 📚 Multi-Language Support
- **5 Languages Available:**
  - **English** (en) - Default
  - **中文** (zh) - Chinese
  - **বাংলা** (bn) - Bengali
  - **Español** (es) - Spanish
  - **Français** (fr) - French

### 💱 Multi-Currency Support
- **6 Currencies Available:**
  - **BDT** (৳) - Bangladeshi Taka (Base Currency)
  - **HKD** (HK$) - Hong Kong Dollar ⭐
  - **USD** ($) - US Dollar
  - **EUR** (€) - Euro
  - **GBP** (£) - British Pound
  - **CNY** (¥) - Chinese Yuan

### 🎯 Key Features
- ✅ Real-time language switching
- ✅ Real-time currency conversion with accurate exchange rates
- ✅ Persistent user preferences (saved in localStorage)
- ✅ Responsive switchers for desktop and mobile
- ✅ Automatic price conversion on all product displays
- ✅ Translated UI elements (buttons, labels, toasts, messages)
- ✅ No page reload required

---

## 🚀 How to Use

### For Users

#### Switching Language:
1. Look for the **🌐 Globe icon** with language code in the top announcement bar
2. Click on it to open the language dropdown
3. Select your preferred language from:
   - English
   - 中文 (Chinese)
   - বাংলা (Bengali)
   - Español (Spanish)
   - Français (French)
4. The entire interface updates immediately

#### Switching Currency:
1. Look for the **$ Currency icon** in the top announcement bar (next to language)
2. Click on it to open the currency dropdown
3. Select your preferred currency (e.g., **HK$ HKD** for Hong Kong Dollar)
4. All product prices convert automatically using real exchange rates
5. Example: ৳1,200 BDT → HK$82.80 when HKD is selected

### Mobile Users:
- Compact language/currency switchers appear in the top bar
- Same functionality, optimized for touch interfaces

---

## 💻 Technical Implementation

### Architecture

```
client/src/
├── contexts/
│   ├── language-context.tsx    # Language management & translations
│   └── currency-context.tsx    # Currency conversion & formatting
├── components/
│   └── language-currency-switcher.tsx  # UI switcher components
└── App.tsx                      # Context providers integration
```

### Context Providers

#### LanguageContext
- Manages current language state
- Provides translation function `t(key)`
- Persists selection to localStorage
- Updates document language attribute

#### CurrencyContext
- Manages current currency state
- Provides conversion function `convert(amount)`
- Provides formatting function `format(amount)`
- Real exchange rates from BDT base currency
- Persists selection to localStorage

### Exchange Rates (as of implementation)

| Currency | Symbol | Rate (from BDT) |
|----------|--------|-----------------|
| BDT      | ৳      | 1.0000          |
| HKD      | HK$    | 0.0690          |
| USD      | $      | 0.0088          |
| EUR      | €      | 0.0082          |
| GBP      | £      | 0.0070          |
| CNY      | ¥      | 0.0640          |

**Example Conversion:**
- Product Price: ৳1,500 BDT
- In HKD: HK$103.50 (1500 × 0.069)
- In USD: $13.20 (1500 × 0.0088)
- In EUR: €12.30 (1500 × 0.0082)

---

## 🔧 Developer Guide

### Using Translation in Components

```typescript
import { useLanguage } from '@/contexts/language-context';

function MyComponent() {
  const { t } = useLanguage();
  
  return (
    <button>{t('product.addToCart')}</button>
  );
}
```

### Using Currency Conversion in Components

```typescript
import { useCurrency } from '@/contexts/currency-context';

function ProductCard({ product }) {
  const { format } = useCurrency();
  
  return (
    <div>
      <span>{format(product.price)}</span>
    </div>
  );
}
```

### Adding New Translations

Edit `client/src/contexts/language-context.tsx`:

```typescript
const translations = {
  en: {
    'my.new.key': 'My New Text',
  },
  zh: {
    'my.new.key': '我的新文本',
  },
  // ... other languages
};
```

### Adding New Currency

Edit `client/src/contexts/currency-context.tsx`:

```typescript
const currencies = {
  // ... existing currencies
  JPY: { 
    code: 'JPY', 
    symbol: '¥', 
    name: 'Japanese Yen', 
    rate: 1.30  // Exchange rate from BDT
  },
};
```

### Translation Keys Available

#### Navigation
- `nav.home`, `nav.catFood`, `nav.dogFood`, `nav.catToys`, `nav.catLitter`, `nav.bird`, `nav.rabbit`, `nav.blog`, `nav.categories`

#### Search
- `search.placeholder`, `search.mobilePlaceholder`, `search.noResults`

#### User Actions
- `user.signIn`, `user.signUp`, `user.signOut`, `user.viewDashboard`, `user.viewAdmin`

#### Cart
- `cart.title`, `cart.addedToCart`, `cart.itemAdded`, `cart.empty`, `cart.checkout`

#### Product
- `product.addToCart`, `product.buyNow`, `product.inStock`, `product.outOfStock`, `product.lowStock`
- `product.bestSeller`, `product.new`, `product.rating`, `product.reviews`
- `product.description`, `product.specifications`, `product.features`

#### Common
- `common.loading`, `common.error`, `common.success`, `common.cancel`, `common.confirm`
- `common.save`, `common.delete`, `common.edit`, `common.view`, `common.more`, `common.less`

#### Footer
- `footer.customerService`, `footer.aboutUs`, `footer.contact`, `footer.termsConditions`
- `footer.privacyPolicy`, `footer.followUs`, `footer.copyright`

---

## 📱 Components Updated

The following components have been updated to support language and currency:

### Header Component
- Language switcher added to top bar
- Currency switcher added to top bar
- Search placeholders translated
- Button labels translated

### Product Cards
- All prices use currency conversion
- "Add to Cart" button translated
- Product badges translated (Best Seller, New, Low Stock)
- Toast messages translated

### UI Components
- Toast notifications translated
- Button labels translated
- Status messages translated

---

## 🎨 UI/UX Features

### Desktop View
- Language and currency dropdowns in top announcement bar
- Next to "Follow" social media links
- Dropdown shows full language names and currency details
- Selected option marked with ✓ checkmark

### Mobile View
- Compact switchers with icons only
- Language shows 2-letter code (e.g., "EN", "ZH")
- Currency shows symbol only (e.g., "৳", "HK$")
- Touch-optimized dropdowns

### Visual Indicators
- Current selection highlighted in green (#26732d)
- Checkmark (✓) next to active selection
- Hover effects on dropdown items
- Smooth transitions

---

## 🔄 Data Persistence

User preferences are saved in browser localStorage:

```javascript
localStorage.setItem('language', 'zh');  // Chinese
localStorage.setItem('currency', 'HKD'); // Hong Kong Dollar
```

- Preferences persist across browser sessions
- No server-side storage required
- Instant loading on page refresh

---

## 📊 Example Use Cases

### Case 1: Hong Kong Customer
1. User visits site (sees English, BDT prices)
2. Switches language to **中文** (Chinese)
3. Switches currency to **HK$ HKD**
4. Sees: "加入購物車" button and "HK$82.80" prices
5. Preferences saved for next visit

### Case 2: Spanish Customer
1. User switches to **Español**
2. Switches to **€ EUR**
3. Sees: "Agregar al Carrito" and "€12.30"
4. Shopping cart and checkout also translated

### Case 3: Bengali Local Customer
1. Uses **বাংলা** language
2. Keeps **৳ BDT** currency
3. Sees: "কার্টে যোগ করুন" and "৳1,500"
4. Native shopping experience

---

## ⚙️ Configuration

### Updating Exchange Rates

Exchange rates should be updated periodically. Edit `client/src/contexts/currency-context.tsx`:

```typescript
const currencies: Record<Currency, CurrencyInfo> = {
  HKD: { 
    code: 'HKD', 
    symbol: 'HK$', 
    name: 'Hong Kong Dollar', 
    rate: 0.069  // Update this value
  },
  // ... other currencies
};
```

**Recommended:** Implement an API call to fetch live exchange rates from a service like:
- [ExchangeRate-API](https://www.exchangerate-api.com/)
- [Open Exchange Rates](https://openexchangerates.org/)
- [Fixer.io](https://fixer.io/)

### Adding More Languages

1. Add language to `translations` object
2. Add language name to `languageNames`
3. Translate all existing keys
4. Update TypeScript type if needed

---

## 🐛 Troubleshooting

### Language Not Changing
- Check browser console for errors
- Verify LanguageProvider is wrapping the app
- Clear localStorage and refresh

### Prices Not Converting
- Check browser console for errors
- Verify CurrencyProvider is wrapping the app
- Check exchange rates are numbers (not strings)

### Preferences Not Saving
- Check browser localStorage is enabled
- Check for privacy/incognito mode
- Clear cache and retry

### Missing Translations
- Check translation key exists in all languages
- Fallback to English if key not found
- Add missing keys to translation object

---

## 📈 Future Enhancements

### Planned Features:
- [ ] Automatic language detection from browser
- [ ] GeoIP-based currency detection
- [ ] Live exchange rate API integration
- [ ] More language options (Arabic, Japanese, Korean, etc.)
- [ ] More currency options (CAD, AUD, SGD, etc.)
- [ ] Backend integration for user preferences
- [ ] A/B testing for default currency by region
- [ ] Admin panel to manage exchange rates

### Advanced Features:
- [ ] Right-to-left (RTL) support for Arabic
- [ ] Date/time localization
- [ ] Number formatting per locale
- [ ] Currency conversion history
- [ ] Multi-currency pricing in database

---

## 🎯 Best Practices

### For Developers:
1. Always use `t('key')` for user-facing text
2. Always use `format(price)` for displaying prices
3. Test in all supported languages
4. Keep translation keys organized by feature
5. Document new translation keys

### For Translators:
1. Keep translations concise for UI elements
2. Consider mobile screen space
3. Use appropriate formal/informal tone
4. Test visual layout after translation
5. Maintain consistency in terminology

### For Administrators:
1. Update exchange rates regularly (weekly recommended)
2. Monitor user preferences analytics
3. Test checkout flow in all currencies
4. Ensure payment gateway supports multiple currencies
5. Update legal text (terms, privacy) in all languages

---

## 📞 Support

For questions or issues related to language and currency features:

1. Check this guide first
2. Review component documentation
3. Check browser console for errors
4. Contact development team

---

## 🎉 Summary

The MeowMeow PetShop now offers a fully localized experience with:
- ✅ 5 languages
- ✅ 6 currencies including Hong Kong Dollar
- ✅ Real-time conversion
- ✅ Persistent preferences
- ✅ Mobile-responsive design

Users can now shop in their preferred language and currency, creating a more personalized and accessible e-commerce experience!

---

**Last Updated:** Saturday, November 1, 2025
**Version:** 1.0.0
**Implementation Status:** ✅ Complete


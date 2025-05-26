# Multi-Language Support for Blink Pay Button

The Blink Pay Button widget now supports **35+ languages**, making Bitcoin Lightning donations accessible to users worldwide, with particular focus on Global South countries.

## Supported Languages

The widget currently supports the following languages:

### Major International Languages
- **English** (`en`) - Default
- **Spanish** (`es`) - Español  
- **French** (`fr`) - Français
- **Portuguese** (`pt`) - Português
- **Russian** (`ru`) - Русский
- **Arabic** (`ar`) - العربية
- **Chinese** (`zh`) - 中文
- **Japanese** (`ja`) - 日本語

### European Languages
- **German** (`de`) - Deutsch
- **Italian** (`it`) - Italiano
- **Dutch** (`nl`) - Nederlands
- **Danish** (`da`) - Dansk
- **Swedish** (`sv`) - Svenska
- **Greek** (`el`) - Ελληνικά
- **Romanian** (`ro`) - Română
- **Hungarian** (`hu`) - Magyar
- **Croatian** (`hr`) - Hrvatski
- **Serbian** (`sr`) - Српски
- **Bosnian** (`bs`) - Bosanski
- **Czech** (`cs`) - Čeština
- **Polish** (`pl`) - Polski
- **Lithuanian** (`lt`) - Lietuvių
- **Finnish** (`fi`) - Suomi
- **Albanian** (`sq`) - Shqip
- **Turkish** (`tr`) - Türkçe

### African Languages
- **Swahili** (`sw`) - Kiswahili
- **Afrikaans** (`af`) - Afrikaans
- **Xhosa** (`xh`) - isiXhosa
- **Zulu** (`zu`) - isiZulu

### Asian Languages
- **Indonesian** (`id`) - Bahasa Indonesia
- **Thai** (`th`) - ไทย
- **Vietnamese** (`vi`) - Tiếng Việt
- **Hindi** (`hi`) - हिन्दी
- **Bengali** (`bn`) - বাংলা
- **Persian/Farsi** (`fa`) - فارسی
- **Pashto** (`ps`) - پښتو

## Global South Focus

This language expansion specifically targets Global South regions where Bitcoin adoption is growing rapidly:

- **Africa**: Swahili, Afrikaans, Xhosa, Zulu
- **Asia**: Hindi, Bengali, Indonesian, Thai, Vietnamese
- **Middle East**: Arabic, Persian, Pashto, Turkish
- **Latin America**: Spanish, Portuguese
- **Eastern Europe**: Multiple Slavic and regional languages

## Usage

### Using the Generator

When using the [Blink Pay Button Generator](https://blinkbitcoin.github.io/donation-button.blink.sv/), you can now:

1. Select your preferred language from the "Widget Language" dropdown
2. The generator will include the language parameter in the generated code
3. The preview will show the widget in the selected language

### Manual Configuration

You can also set the language manually when initializing the widget:

```javascript
BlinkPayButton.init({
  username: 'your-blink-username',
  containerId: 'blink-pay-button-container',
  language: 'es', // Set to Spanish
  themeMode: 'light',
  defaultAmount: 1000,
  supportedCurrencies: [
    { code: 'sats', name: 'sats', isCrypto: true },
    { code: 'USD', name: 'USD', isCrypto: false }
  ]
});
```

## Localized Text Elements

The following text elements are localized:

- **Button Text**: "Donate Bitcoin" → "Donar Bitcoin" (ES), "Faire un Don Bitcoin" (FR), etc.
- **Copy Invoice**: "Copy Invoice" → "Copiar Factura" (ES), "Copier la Facture" (FR), etc.
- **Success Message**: "Payment Successful. Thank you for donating." → "Pago Exitoso. Gracias por donar." (ES)
- **Status Messages**: Error messages, loading text, copy confirmations
- **QR Code Alt Text**: Accessibility text for the QR code image

## Example: Spanish Widget

```javascript
BlinkPayButton.init({
  username: 'tu-usuario-blink',
  containerId: 'blink-pay-button-container',
  language: 'es',
  themeMode: 'light',
  defaultAmount: 1000
});
```

This will display:
- Button: "Donar Bitcoin"
- Copy button: "Copiar Factura"
- Success: "Pago Exitoso. Gracias por donar."

## Fallback Behavior

- If an unsupported language code is provided, the widget falls back to English
- If a translation key is missing, it falls back to the English version
- The widget gracefully handles missing translations to ensure functionality

## Testing

You can test the multi-language functionality using the included test page:

```html
<!-- Include the test-multilang.html file in your browser -->
```

This test page allows you to switch between all supported languages and see the widget in both light and dark themes.

## Custom Translations

If you need to customize the text or add support for additional languages, you can:

1. Fork the repository
2. Add your translations to the `translations` object in `js/blink-pay-button.js`
3. Test your translations
4. Submit a pull request

### Translation Object Structure

```javascript
translations: {
  'your-language-code': {
    buttonText: 'Your Button Text',
    copyInvoice: 'Your Copy Text',
    copied: 'Your Copied Text',
    paymentSuccessful: 'Your Success Message',
    loading: 'Your Loading Text',
    invoiceCopied: 'Your Invoice Copied Message',
    failedToCopy: 'Your Failed to Copy Message',
    pleaseEnterValidAmount: 'Your Validation Message',
    amountMustBeAtLeast: 'Your Minimum Amount Message',
    failedToFetchExchangeRate: 'Your Exchange Rate Error',
    pleaseTryAgain: 'Your Try Again Message',
    anErrorOccurred: 'Your Generic Error Message',
    qrCodeAlt: 'Your QR Code Alt Text'
  }
}
```

## Browser Compatibility

The multi-language feature works with all modern browsers that support the base widget functionality. No additional dependencies are required. 
# Blink Pay Button Widget

A lightweight, embeddable Bitcoin Lightning donation widget that integrates with [Blink](https://blink.sv/) for instant, low-fee Bitcoin payments. Built with vanilla JavaScript and designed for easy integration into any website.

## 🚀 Features

- **⚡ Lightning Fast**: Instant Bitcoin Lightning payments via Blink API
- **💰 Multi-Currency**: Support for 30+ fiat currencies (USD, EUR, GBP, etc.) with automatic conversion
- **🎨 Customizable**: Light/dark themes and flexible styling
- **📱 Responsive**: Works perfectly on desktop and mobile devices
- **🔧 Easy Integration**: Simple embed code - just copy and paste
- **💸 Low Fees**: Leverage Blink's competitive Lightning Network fees
- **🌐 No Backend Required**: Pure frontend solution, no server needed
- **📝 Memo Support**: Automatic memo generation with username
- **📊 Analytics Tracking**: Built-in referral tracking to help Blink understand widget usage

## 🎯 Live Demo

**Generator**: [https://widget.twentyone.ist](https://widget.twentyone.ist)

Try the widget generator to create your own donation button in seconds!

## 🏃‍♂️ Quick Start

### 1. Generate Your Widget

Visit [widget.twentyone.ist](https://widget.twentyone.ist) and:
1. Enter your Blink username
2. Choose theme (light/dark)
3. Select supported currencies
4. Copy the generated code

### 2. Embed in Your Site

Paste the generated code into your HTML:

```html
<!-- Blink Pay Button widget -->
<div id="blink-pay-button-container"></div>

<!-- Blink Pay Button script -->
<script src="https://widget.twentyone.ist/js/blink-pay-button.js"></script>
<script>
  BlinkPayButton.init({
    username: 'your-blink-username',
    containerId: 'blink-pay-button-container',
    buttonText: 'Donate Bitcoin',
    themeMode: 'light',
    defaultAmount: 1000,
    supportedCurrencies: [
      { code: 'sats', name: 'sats', isCrypto: true },
      { code: 'USD', name: 'USD', isCrypto: false },
      { code: 'EUR', name: 'EUR', isCrypto: false }
    ],
    debug: false
  });
</script>
```

### 3. Start Receiving Donations

Your widget is now live and ready to receive Bitcoin Lightning donations!

## ⚙️ Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `username` | string | **required** | Your Blink username (without @) |
| `containerId` | string | **required** | HTML element ID where widget renders |
| `buttonText` | string | `'Donate Bitcoin'` | Text displayed on the button |
| `themeMode` | string | `'light'` | Theme: `'light'` or `'dark'` |
| `defaultAmount` | number | `1000` | Default amount in sats |
| `supportedCurrencies` | array | `[sats, USD]` | Array of currency objects |
| `debug` | boolean | `false` | Enable console logging |

### Currency Configuration

Each currency object should have:
```javascript
{
  code: 'USD',        // 3-letter currency code
  name: 'USD',        // Display name
  isCrypto: false     // true for crypto, false for fiat
}
```

## 🌍 Supported Currencies

The widget supports 30+ currencies through Blink's exchange rate API:

**Major**: USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY  
**Regional**: ZAR, BRL, MXN, INR, KRW, SGD, THB, PHP  
**African**: NGN, KES, GHS, UGX, TZS, RWF, ETB  
**Others**: NOK, SEK, DKK, PLN, CZK, HUF, TRY, ILS, AED, SAR

## 📊 Analytics Tracking

The widget includes built-in analytics tracking when users click the Blink logo. This helps Blink understand widget usage and track referrals from embedded donation buttons.

**Tracked Information:**
- Username configured in the widget
- Source URL where the widget is embedded  
- Widget version
- Referral source identifier

**Privacy:** Only publicly available information is tracked. Website owners can modify or remove analytics if desired. See [ANALYTICS-README.md](ANALYTICS-README.md) for full details.

## 🎨 Styling

The widget automatically adapts to light/dark themes and is fully responsive. You can customize the appearance with CSS:

```css
/* Custom styling example */
#blink-pay-button-container {
  max-width: 400px;
  margin: 0 auto;
}

/* Override button colors */
.blink-pay-button {
  background: your-custom-color !important;
}
```

## 🔧 Development

### Prerequisites

- Node.js 16+ and npm
- A [Blink](https://blink.sv/) account

### Setup

1. Clone the repository:
```bash
git clone https://github.com/pretyflaco/blink-donation-widget.git
cd blink-donation-widget
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000)

### Project Structure

```
├── public/
│   ├── index.html              # Widget generator interface
│   │   ├── js/
│   │   │   ├── blink-pay-button.js # Main widget code
│   │   │   └── generator.js        # Generator interface logic
│   │   └── img/                    # Assets (logos, icons)
│   ├── package.json                # Dependencies and scripts
│   └── server.js                   # Development server
└── README.md                   # This file
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0) - see the [LICENSE](LICENSE) file for details.

**Why AGPL-3.0?** We chose this strong copyleft license to ensure that:
- ✅ The widget remains free and open source forever
- ✅ Any improvements made by the community benefit everyone
- ✅ If someone hosts a modified version, they must share their improvements
- ✅ Commercial use is allowed while protecting the commons

**What this means for you:**
- 🆓 **Free to use**: Embed the widget anywhere, including commercial sites
- 🔄 **Share improvements**: If you modify and host the widget, make your code available
- 🤝 **Community benefits**: Help make Bitcoin donations accessible to everyone

## 🙏 Acknowledgments

- [Blink](https://blink.sv/) for providing the Lightning payment infrastructure
- Built with ❤️ for the Bitcoin Lightning Network community
- Inspired by the need for simple, accessible Bitcoin donations

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/pretyflaco/blink-donation-widget/issues)
- **Documentation**: [Widget Generator](https://widget.twentyone.ist)
- **Blink Support**: [Blink Developer Docs](https://dev.blink.sv/)

## 🔗 Links

- **Live Generator**: [widget.twentyone.ist](https://widget.twentyone.ist)
- **Blink Wallet**: [blink.sv](https://blink.sv/)
- **Lightning Network**: [lightning.network](https://lightning.network/)

---

**Made with ⚡ for the Bitcoin Lightning Network** 
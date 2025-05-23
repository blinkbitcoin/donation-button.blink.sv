/**
 * Blink Pay Button Widget
 * A simple widget for accepting Bitcoin Lightning donations via Blink wallet
 */
(function() {
    // Translation objects for multi-language support
    const translations = {
        en: {
            buttonText: 'Donate Bitcoin',
            copyInvoice: 'Copy Invoice',
            copied: 'Copied!',
            paymentSuccessful: 'Payment Successful. Thank you for donating.',
            loading: 'Loading...',
            invoiceCopied: 'Invoice copied to clipboard',
            failedToCopy: 'Failed to copy invoice',
            pleaseEnterValidAmount: 'Please enter a valid amount',
            amountMustBeAtLeast: 'Amount must be at least',
            failedToFetchExchangeRate: 'Failed to fetch exchange rate for',
            pleaseTryAgain: 'Please try again.',
            anErrorOccurred: 'An error occurred while processing your donation',
            qrCodeAlt: 'Lightning Invoice QR Code'
        },
        es: {
            buttonText: 'Donar Bitcoin',
            copyInvoice: 'Copiar Factura',
            copied: '¡Copiado!',
            paymentSuccessful: 'Pago Exitoso. Gracias por donar.',
            loading: 'Cargando...',
            invoiceCopied: 'Factura copiada al portapapeles',
            failedToCopy: 'Error al copiar la factura',
            pleaseEnterValidAmount: 'Por favor ingrese una cantidad válida',
            amountMustBeAtLeast: 'La cantidad debe ser al menos',
            failedToFetchExchangeRate: 'Error al obtener el tipo de cambio para',
            pleaseTryAgain: 'Por favor intente de nuevo.',
            anErrorOccurred: 'Ocurrió un error al procesar su donación',
            qrCodeAlt: 'Código QR de Factura Lightning'
        },
        fr: {
            buttonText: 'Faire un Don Bitcoin',
            copyInvoice: 'Copier la Facture',
            copied: 'Copié !',
            paymentSuccessful: 'Paiement Réussi. Merci pour votre don.',
            loading: 'Chargement...',
            invoiceCopied: 'Facture copiée dans le presse-papiers',
            failedToCopy: 'Échec de la copie de la facture',
            pleaseEnterValidAmount: 'Veuillez entrer un montant valide',
            amountMustBeAtLeast: 'Le montant doit être au moins',
            failedToFetchExchangeRate: 'Échec de récupération du taux de change pour',
            pleaseTryAgain: 'Veuillez réessayer.',
            anErrorOccurred: 'Une erreur s\'est produite lors du traitement de votre don',
            qrCodeAlt: 'Code QR de Facture Lightning'
        },
        de: {
            buttonText: 'Bitcoin Spenden',
            copyInvoice: 'Rechnung Kopieren',
            copied: 'Kopiert!',
            paymentSuccessful: 'Zahlung Erfolgreich. Vielen Dank für Ihre Spende.',
            loading: 'Lädt...',
            invoiceCopied: 'Rechnung in die Zwischenablage kopiert',
            failedToCopy: 'Fehler beim Kopieren der Rechnung',
            pleaseEnterValidAmount: 'Bitte geben Sie einen gültigen Betrag ein',
            amountMustBeAtLeast: 'Der Betrag muss mindestens',
            failedToFetchExchangeRate: 'Fehler beim Abrufen des Wechselkurses für',
            pleaseTryAgain: 'Bitte versuchen Sie es erneut.',
            anErrorOccurred: 'Bei der Verarbeitung Ihrer Spende ist ein Fehler aufgetreten',
            qrCodeAlt: 'Lightning Rechnung QR-Code'
        },
        pt: {
            buttonText: 'Doar Bitcoin',
            copyInvoice: 'Copiar Fatura',
            copied: 'Copiado!',
            paymentSuccessful: 'Pagamento Bem-sucedido. Obrigado por doar.',
            loading: 'Carregando...',
            invoiceCopied: 'Fatura copiada para a área de transferência',
            failedToCopy: 'Falha ao copiar a fatura',
            pleaseEnterValidAmount: 'Por favor, insira um valor válido',
            amountMustBeAtLeast: 'O valor deve ser pelo menos',
            failedToFetchExchangeRate: 'Falha ao buscar taxa de câmbio para',
            pleaseTryAgain: 'Por favor, tente novamente.',
            anErrorOccurred: 'Ocorreu um erro ao processar sua doação',
            qrCodeAlt: 'Código QR da Fatura Lightning'
        },
        it: {
            buttonText: 'Dona Bitcoin',
            copyInvoice: 'Copia Fattura',
            copied: 'Copiato!',
            paymentSuccessful: 'Pagamento Riuscito. Grazie per aver donato.',
            loading: 'Caricamento...',
            invoiceCopied: 'Fattura copiata negli appunti',
            failedToCopy: 'Impossibile copiare la fattura',
            pleaseEnterValidAmount: 'Per favore inserisci un importo valido',
            amountMustBeAtLeast: 'L\'importo deve essere almeno',
            failedToFetchExchangeRate: 'Impossibile recuperare il tasso di cambio per',
            pleaseTryAgain: 'Per favore riprova.',
            anErrorOccurred: 'Si è verificato un errore durante l\'elaborazione della tua donazione',
            qrCodeAlt: 'Codice QR Fattura Lightning'
        },
        ja: {
            buttonText: 'ビットコインを寄付',
            copyInvoice: '請求書をコピー',
            copied: 'コピーしました！',
            paymentSuccessful: '決済成功。ご寄付ありがとうございます。',
            loading: '読み込み中...',
            invoiceCopied: '請求書をクリップボードにコピーしました',
            failedToCopy: '請求書のコピーに失敗しました',
            pleaseEnterValidAmount: '有効な金額を入力してください',
            amountMustBeAtLeast: '金額は最低',
            failedToFetchExchangeRate: '為替レートの取得に失敗しました',
            pleaseTryAgain: '再度お試しください。',
            anErrorOccurred: '寄付の処理中にエラーが発生しました',
            qrCodeAlt: 'Lightning請求書QRコード'
        },
        zh: {
            buttonText: '捐赠比特币',
            copyInvoice: '复制发票',
            copied: '已复制！',
            paymentSuccessful: '支付成功。感谢您的捐赠。',
            loading: '加载中...',
            invoiceCopied: '发票已复制到剪贴板',
            failedToCopy: '复制发票失败',
            pleaseEnterValidAmount: '请输入有效金额',
            amountMustBeAtLeast: '金额必须至少为',
            failedToFetchExchangeRate: '获取汇率失败',
            pleaseTryAgain: '请再试一次。',
            anErrorOccurred: '处理您的捐赠时发生错误',
            qrCodeAlt: 'Lightning发票二维码'
        },
        ru: {
            buttonText: 'Пожертвовать Биткоин',
            copyInvoice: 'Копировать Счёт',
            copied: 'Скопировано!',
            paymentSuccessful: 'Платёж Успешен. Спасибо за пожертвование.',
            loading: 'Загрузка...',
            invoiceCopied: 'Счёт скопирован в буфер обмена',
            failedToCopy: 'Не удалось скопировать счёт',
            pleaseEnterValidAmount: 'Пожалуйста, введите корректную сумму',
            amountMustBeAtLeast: 'Сумма должна быть не менее',
            failedToFetchExchangeRate: 'Не удалось получить курс валют для',
            pleaseTryAgain: 'Пожалуйста, попробуйте снова.',
            anErrorOccurred: 'Произошла ошибка при обработке вашего пожертвования',
            qrCodeAlt: 'QR-код Lightning счёта'
        },
        ar: {
            buttonText: 'تبرع بالبيتكوين',
            copyInvoice: 'نسخ الفاتورة',
            copied: 'تم النسخ!',
            paymentSuccessful: 'تم الدفع بنجاح. شكراً لك على التبرع.',
            loading: 'جاري التحميل...',
            invoiceCopied: 'تم نسخ الفاتورة إلى الحافظة',
            failedToCopy: 'فشل في نسخ الفاتورة',
            pleaseEnterValidAmount: 'يرجى إدخال مبلغ صالح',
            amountMustBeAtLeast: 'يجب أن يكون المبلغ على الأقل',
            failedToFetchExchangeRate: 'فشل في جلب سعر الصرف لـ',
            pleaseTryAgain: 'يرجى المحاولة مرة أخرى.',
            anErrorOccurred: 'حدث خطأ أثناء معالجة تبرعك',
            qrCodeAlt: 'رمز QR لفاتورة Lightning'
        }
    };

    // Widget configuration
    const BlinkPayButton = {
        // Initialize the widget with the given username and container
        init: function(config) {
            this.username = config.username || '';
            this.containerId = config.containerId || 'blink-pay-button-container';
            this.language = config.language || 'en';
            this.buttonText = config.buttonText || this.t('buttonText');
            this.buttonClass = config.buttonClass || 'blink-pay-button';
            this.themeMode = config.themeMode || 'light'; // light or dark
            this.themeColor = config.themeColor || '#FB5607'; // Sunset Orange as default
            this.minAmount = config.minAmount || 1;
            this.defaultAmount = config.defaultAmount || 1000;
            this.container = document.getElementById(this.containerId);
            this.debug = config.debug || false;
            this.logs = [];
            this.selectedCurrency = 'sats'; // Default currency
            this.exchangeRates = {}; // Cache for exchange rates (currency -> rate)
            
            // Configure supported currencies - can be customized by widget creator
            this.supportedCurrencies = config.supportedCurrencies || [
                { code: 'sats', name: 'sats', isCrypto: true },
                { code: 'USD', name: 'USD', isCrypto: false },
            ];
            
            if (!this.username) {
                console.error('Blink Pay Button: username is required');
                return;
            }
            
            if (!this.container) {
                console.error(`Blink Pay Button: container element with ID "${this.containerId}" not found`);
                return;
            }
            
            this.render();
            this.attachEventListeners();
            this.log('Widget initialized for username: ' + this.username);
        },
        
        // Translation helper function
        t: function(key, params = {}) {
            const lang = translations[this.language] || translations['en'];
            let text = lang[key] || translations['en'][key] || key;
            
            // Simple parameter substitution
            Object.keys(params).forEach(param => {
                text = text.replace(`{${param}}`, params[param]);
            });
            
            return text;
        },
        
        // Add a log entry
        log: function(message, data) {
            if (!this.debug) return;
            
            const timestamp = new Date().toISOString().slice(11, 23); // HH:MM:SS.sss
            const logEntry = {
                timestamp,
                message,
                data
            };
            
            this.logs.push(logEntry);
            console.log(`[BlinkPay ${timestamp}]`, message, data || '');
        },
        
        // Render the widget in the container
        render: function() {
            // Blink logos for both light and dark modes with absolute URLs
            const blinkLogoLight = 'https://widget.twentyone.ist/img/blink-light.svg';
            const blinkLogoDark = 'https://widget.twentyone.ist/img/blink-dark.svg';
            const checkmarkSvg = 'https://widget.twentyone.ist/img/successcheckmark.svg';
            
            // Define CSS colors based on the Blink brand
            const colors = {
                sunset: '#FB5607',
                lightning: '#FFB32C',
                gradient: 'linear-gradient(45deg, #fe9f0c, #fc5805)',
                dark: '#222222',
                light: '#FFFFFF',
                darkBg: '#333333',
                lightBg: '#F8F9FA'
            };
            
            // Choose colors based on theme
            const mainColor = this.themeColor || colors.sunset;
            const isDark = this.themeMode === 'dark';
            const textColor = isDark ? colors.light : colors.dark;
            const bgColor = isDark ? colors.darkBg : colors.lightBg;
            const borderColor = isDark ? '#444444' : '#E0E0E0';
            const inputBgColor = isDark ? '#444444' : colors.light;
            const secondaryBgColor = isDark ? '#444444' : '#F1F1F1';
            const logo = isDark ? blinkLogoDark : blinkLogoLight;
            
            const styles = `
                @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&display=swap');
                
                .blink-pay-widget {
                    font-family: 'IBM Plex Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    width: 370px;
                    height: 265px;
                    margin: 0 auto;
                    padding: 20px;
                    border-radius: 12px;
                    background-color: ${bgColor};
                    color: ${textColor};
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    border: 1px solid ${borderColor};
                    position: relative;
                    display: flex;
                    flex-direction: column;
                }
                
                /* Top third - Header */
                .blink-pay-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    height: 32px; /* Top third */
                    margin-bottom: 15px;
                    width: 100%;
                }
                .blink-pay-logo {
                    width: 100px;
                    height: 30.365px;
                    transition: transform 0.2s;
                }
                .blink-pay-logo:hover {
                    transform: scale(1.05);
                }
                .blink-pay-username {
                    font-size: 12px;
                    color: ${textColor};
                    opacity: 0.8;
                    text-align: right;
                }
                
                /* Middle third - Content */
                .blink-pay-content {
                    height: 140px; /* Middle third */
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    gap: 15px;
                }
                .blink-pay-input-group {
                    width: 100%;
                    display: flex;
                    border: 1px solid ${borderColor};
                    border-radius: 8px;
                    overflow: hidden;
                    background-color: ${inputBgColor};
                }
                .blink-pay-input-group input {
                    flex: 1;
                    padding: 10px 12px;
                    border: none;
                    background-color: ${inputBgColor};
                    color: ${textColor};
                    font-size: 16px;
                    font-family: 'IBM Plex Sans', sans-serif;
                }
                .blink-pay-currency-select {
                    border: none;
                    background-color: ${secondaryBgColor};
                    color: ${textColor};
                    font-size: 16px;
                    font-weight: 500;
                    padding: 10px 12px;
                    cursor: pointer;
                    font-family: 'IBM Plex Sans', sans-serif;
                    min-width: 70px;
                }
                .blink-pay-currency-select:focus {
                    outline: none;
                }
                .blink-pay-qr {
                    display: none;
                    width: 100%;
                    height: 140px;
                    justify-content: center;
                    align-items: center;
                }
                .blink-pay-qr img {
                    width: 130px;
                    height: 130px;
                    background-color: white;
                    border-radius: 8px;
                    padding: 8px;
                }
                .blink-pay-success {
                    display: none;
                    width: 100%;
                    height: 140px;
                    justify-content: center;
                    align-items: center;
                }
                .blink-pay-success img {
                    width: 100px;
                    height: 100px;
                }
                
                /* Bottom third - Button & Footer */
                .blink-pay-footer {
                    height: 38px; /* Bottom third */
                    display: flex;
                    flex-direction: column;
                    margin-top: auto;
                }
                .${this.buttonClass} {
                    width: 100%;
                    padding: 10px 12px;
                    background: ${colors.gradient};
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: 600;
                    text-align: center;
                    transition: all 0.2s;
                    font-family: 'IBM Plex Sans', sans-serif;
                    margin-bottom: 10px;
                }
                .${this.buttonClass}.success {
                    background: #00a700;
                }
                .${this.buttonClass}:hover {
                    opacity: 0.9;
                    transform: translateY(-1px);
                }
                .blink-pay-status {
                    padding: 8px;
                    border-radius: 8px;
                    display: none;
                    text-align: center;
                    font-weight: 500;
                    font-size: 14px;
                    min-height: 20px;
                }
                .blink-pay-status.success {
                    background-color: ${isDark ? '#2E7D32' : '#E8F5E9'};
                    color: ${isDark ? '#FFFFFF' : '#2E7D32'};
                    display: block;
                }
                .blink-pay-status.error {
                    background-color: ${isDark ? '#C62828' : '#FFEBEE'};
                    color: ${isDark ? '#FFFFFF' : '#C62828'};
                    display: block;
                }
                .blink-pay-spinner {
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                    border: 3px solid rgba(255,255,255,.3);
                    border-radius: 50%;
                    border-top-color: #fff;
                    animation: blink-pay-spin 1s ease-in-out infinite;
                    margin-right: 8px;
                    vertical-align: middle;
                }
                @keyframes blink-pay-spin {
                    to { transform: rotate(360deg); }
                }
                .blink-pay-hidden {
                    display: none;
                }
            `;
            
            // Generate currency options dynamically
            const currencyOptions = this.supportedCurrencies.map(currency => 
                `<option value="${currency.code.toLowerCase()}">${currency.name}</option>`
            ).join('');
            
            const html = `
                <div class="blink-pay-widget">
                    <!-- Top third -->
                    <div class="blink-pay-header">
                        <a href="https://get.blink.sv" target="_blank" rel="noopener noreferrer">
                            <img src="${logo}" alt="Blink" class="blink-pay-logo">
                        </a>
                        <div class="blink-pay-username">${this.username}</div>
                    </div>
                    
                    <!-- Middle third -->
                    <div class="blink-pay-content">
                        <div class="blink-pay-input-group">
                            <input type="number" id="blink-pay-amount" min="${this.minAmount}" value="${this.defaultAmount}" placeholder="Amount">
                            <select id="blink-pay-currency" class="blink-pay-currency-select">
                                ${currencyOptions}
                            </select>
                        </div>
                        
                        <div id="blink-pay-qr" class="blink-pay-qr"></div>
                        <div id="blink-pay-success" class="blink-pay-success">
                            <img src="${checkmarkSvg}" alt="Success">
                        </div>
                    </div>
                    
                    <!-- Bottom third -->
                    <div class="blink-pay-footer">
                        <button class="${this.buttonClass}" id="blink-pay-button">${this.buttonText}</button>
                        <div id="blink-pay-status" class="blink-pay-status"></div>
                    </div>
                </div>
            `;
            
            // Add styles to head
            const styleEl = document.createElement('style');
            styleEl.textContent = styles;
            document.head.appendChild(styleEl);
            
            // Set HTML content
            this.container.innerHTML = html;
        },
        
        // Attach event listeners
        attachEventListeners: function() {
            const donateButton = document.getElementById('blink-pay-button');
            if (donateButton) {
                donateButton.addEventListener('click', this.handleDonate.bind(this));
            }
            
            const currencySelect = document.getElementById('blink-pay-currency');
            if (currencySelect) {
                currencySelect.addEventListener('change', this.handleCurrencyChange.bind(this));
            }
        },
        
        // Handle currency change
        handleCurrencyChange: async function(event) {
            this.selectedCurrency = event.target.value;
            this.log(`Currency changed to: ${this.selectedCurrency}`);
            
            // Find currency configuration
            const currency = this.supportedCurrencies.find(c => c.code.toLowerCase() === this.selectedCurrency);
            
            // Update amount input based on currency
            const amountInput = document.getElementById('blink-pay-amount');
            if (currency && currency.isCrypto) {
                // Crypto currency (sats) - integer values
                amountInput.min = this.minAmount;
                amountInput.step = 1;
                amountInput.value = this.defaultAmount;
                amountInput.placeholder = "Amount";
            } else {
                // Fiat currency - decimal values
                amountInput.min = 0.01;
                amountInput.step = 0.01;
                amountInput.value = 10;
                amountInput.placeholder = `Amount in ${currency ? currency.name : this.selectedCurrency.toUpperCase()}`;
                
                // Fetch exchange rate for fiat currencies
                if (!this.exchangeRates[this.selectedCurrency]) {
                    await this.fetchExchangeRate(this.selectedCurrency);
                }
            }
        },
        
        // Fetch exchange rate for a specific currency
        fetchExchangeRate: async function(currencyCode) {
            this.log(`Fetching exchange rate for ${currencyCode}`);
            
            try {
                const query = `
                    query realtimePrice($currency: DisplayCurrency!) {
                        realtimePrice(currency: $currency) {
                            btcSatPrice {
                                base
                                offset
                            }
                        }
                    }
                `;
                
                const variables = {
                    currency: currencyCode.toUpperCase()
                };
                
                const response = await fetch('https://api.blink.sv/graphql', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query,
                        variables
                    })
                });
                
                const data = await response.json();
                this.log(`Exchange rate response for ${currencyCode}`, data);
                
                if (data.errors) {
                    throw new Error(data.errors[0].message || `Error fetching exchange rate for ${currencyCode}`);
                }
                
                const btcSatPrice = data.data.realtimePrice.btcSatPrice;
                const exchangeRate = btcSatPrice.base * Math.pow(10, btcSatPrice.offset);
                
                // Cache the rate
                this.exchangeRates[currencyCode] = exchangeRate;
                this.log(`Exchange rate for ${currencyCode}: ${exchangeRate} sats per unit`);
                
                return exchangeRate;
                
            } catch (error) {
                this.log(`Error fetching exchange rate for ${currencyCode}: ${error.message}`, error);
                console.error('Error fetching exchange rate:', error);
                this.showStatus('error', `${this.t('failedToFetchExchangeRate')} ${currencyCode}. ${this.t('pleaseTryAgain')}`);
                throw error;
            }
        },
        
        // Convert amount to sats based on selected currency
        convertToSats: function(amount) {
            if (this.selectedCurrency === 'sats') {
                return amount; // Already in sats
            }
            
            // For fiat currencies, use cached exchange rate
            const exchangeRate = this.exchangeRates[this.selectedCurrency];
            if (!exchangeRate) {
                throw new Error(`Exchange rate not available for ${this.selectedCurrency.toUpperCase()}`);
            }
            
            const satsAmount = Math.round(amount * exchangeRate);
            this.log(`Converting ${amount} ${this.selectedCurrency.toUpperCase()} to ${satsAmount} sats (rate: ${exchangeRate.toFixed(2)})`);
            return satsAmount;
        },
        
        // Handle the donation process
        handleDonate: async function() {
            this.log('Donate button clicked');
            
            const amountInput = document.getElementById('blink-pay-amount');
            const amount = parseFloat(amountInput.value);
            
            if (isNaN(amount) || amount <= 0) {
                this.showStatus('error', this.t('pleaseEnterValidAmount'));
                return;
            }
            
            // Convert to sats if necessary and validate minimum
            let amountInSats;
            if (this.selectedCurrency === 'sats') {
                amountInSats = amount;
                if (amountInSats < this.minAmount) {
                    this.showStatus('error', `${this.t('amountMustBeAtLeast')} ${this.minAmount} sats`);
                    return;
                }
            } else {
                if (amount < 0.01) {
                    this.showStatus('error', `${this.t('amountMustBeAtLeast')} 0.01 ${this.selectedCurrency.toUpperCase()}`);
                    return;
                }
                
                let exchangeRate = this.exchangeRates[this.selectedCurrency];
                if (!exchangeRate) {
                    // If we don't have the exchange rate, try to fetch it
                    try {
                        await this.fetchExchangeRate(this.selectedCurrency);
                        exchangeRate = this.exchangeRates[this.selectedCurrency];
                    } catch (error) {
                        return; // Error already shown in fetchExchangeRate
                    }
                }
                
                amountInSats = Math.round(amount * exchangeRate);
            }
            
            // Clear any previous status messages and start loading
            this.showStatus('', '');
            this.setButtonLoading(true);
            
            try {
                this.log(`Processing donation: ${amount} ${this.selectedCurrency} (${amountInSats} sats)`);
                
                // Step 1: Get wallet ID
                const walletId = await this.getAccountDefaultWalletId(this.username);
                if (!walletId) {
                    throw new Error('Could not retrieve wallet ID for this username');
                }
                this.log(`Retrieved wallet ID: ${walletId}`);
                
                // Step 2: Create invoice
                const paymentRequest = await this.createInvoice(walletId, amountInSats);
                if (!paymentRequest) {
                    throw new Error('Could not create invoice');
                }
                this.log(`Created invoice`, { paymentRequest: paymentRequest.substring(0, 30) + '...' });
                
                // Step 3: Show QR code and set up payment monitoring
                this.displayInvoice(paymentRequest);
                this.subscribeToPaymentStatus(paymentRequest);
                
            } catch (error) {
                this.log(`Error in donation process: ${error.message}`, error);
                console.error('Blink Pay Button Error:', error);
                this.showStatus('error', error.message || this.t('anErrorOccurred'));
                this.setButtonLoading(false);
            }
        },
        
        // Get the default wallet ID for a username
        getAccountDefaultWalletId: async function(username) {
            const query = `
                query Query($username: Username!) {
                    accountDefaultWallet(username: $username) {
                        id
                    }
                }
            `;
            
            const variables = {
                username: username
            };
            
            try {
                this.log(`Fetching from API: accountDefaultWallet`, { variables });
                const response = await fetch('https://api.blink.sv/graphql', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query,
                        variables
                    })
                });
                
                const data = await response.json();
                this.log(`API response for accountDefaultWallet`, data);
                
                if (data.errors) {
                    throw new Error(data.errors[0].message || 'Error fetching wallet ID');
                }
                
                return data.data.accountDefaultWallet?.id;
                
            } catch (error) {
                this.log(`API error for accountDefaultWallet: ${error.message}`, error);
                console.error('Error getting wallet ID:', error);
                throw error;
            }
        },
        
        // Create a lightning invoice
        createInvoice: async function(walletId, amount) {
            const mutation = `
                mutation Mutation($input: LnInvoiceCreateOnBehalfOfRecipientInput!) {
                    lnInvoiceCreateOnBehalfOfRecipient(input: $input) {
                        invoice {
                            paymentRequest
                        }
                    }
                }
            `;
            
            const variables = {
                input: {
                    recipientWalletId: walletId,
                    amount: amount.toString(),
                    memo: `${this.username} donation widget`
                }
            };
            
            try {
                this.log(`Fetching from API: lnInvoiceCreateOnBehalfOfRecipient`, { variables });
                const response = await fetch('https://api.blink.sv/graphql', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query: mutation,
                        variables
                    })
                });
                
                const data = await response.json();
                this.log(`API response for lnInvoiceCreateOnBehalfOfRecipient`, data);
                
                if (data.errors) {
                    throw new Error(data.errors[0].message || 'Error creating invoice');
                }
                
                return data.data.lnInvoiceCreateOnBehalfOfRecipient.invoice.paymentRequest;
                
            } catch (error) {
                this.log(`API error for lnInvoiceCreateOnBehalfOfRecipient: ${error.message}`, error);
                console.error('Error creating invoice:', error);
                throw error;
            }
        },
        
        // Display the invoice and QR code
        displayInvoice: function(paymentRequest) {
            const qrContainer = document.getElementById('blink-pay-qr');
            const successContainer = document.getElementById('blink-pay-success');
            const amountInput = document.getElementById('blink-pay-amount');
            
            // Hide success container if visible
            successContainer.style.display = 'none';
            
            // Hide input field
            amountInput.parentElement.style.display = 'none';
            
            // Generate QR code using external service
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(paymentRequest)}`;
            this.log(`Generating QR code with URL: ${qrUrl}`);
            
            const qrImage = document.createElement('img');
            qrImage.src = qrUrl;
            qrImage.alt = this.t('qrCodeAlt');
            qrContainer.innerHTML = '';
            qrContainer.appendChild(qrImage);
            qrContainer.style.display = 'flex';
            
            // Update the button for copy to clipboard functionality
            const donateButton = document.getElementById('blink-pay-button');
            donateButton.textContent = this.t('copyInvoice');
            
            // Remove all existing event listeners by cloning and replacing the button
            const newButton = donateButton.cloneNode(true);
            donateButton.parentNode.replaceChild(newButton, donateButton);
            
            // Add new event listener for copying the invoice
            newButton.addEventListener('click', () => {
                navigator.clipboard.writeText(paymentRequest).then(() => {
                    this.showStatus('success', this.t('invoiceCopied'));
                    
                    // Change button text temporarily to show success
                    newButton.textContent = this.t('copied');
                    setTimeout(() => {
                        newButton.textContent = this.t('copyInvoice');
                    }, 1500);
                    
                }).catch(err => {
                    console.error('Could not copy invoice: ', err);
                    this.showStatus('error', this.t('failedToCopy'));
                });
            });
            
            this.setButtonLoading(false);
        },
        
        // Subscribe to payment status updates
        subscribeToPaymentStatus: function(paymentRequest) {
            // WebSocket-based approach for real-time payment status updates
            this.log(`Attempting to connect to WebSocket at wss://ws.blink.sv/graphql`);
            const wsClient = new WebSocket('wss://ws.blink.sv/graphql', 'graphql-transport-ws');
            
            // Connection initialization message
            const initMessage = {
                type: 'connection_init',
                payload: {}
            };
            
            // Message to send when connection is established
            const subscriptionMsg = {
                id: '1',
                type: 'subscribe',
                payload: {
                    query: `
                        subscription LnInvoicePaymentStatusByPaymentRequest($input: LnInvoicePaymentStatusByPaymentRequestInput!) {
                            lnInvoicePaymentStatusByPaymentRequest(input: $input) {
                                paymentRequest
                                status
                            }
                        }
                    `,
                    variables: {
                        input: {
                            paymentRequest: paymentRequest
                        }
                    }
                }
            };
            
            // Initialize WebSocket connection
            wsClient.onopen = () => {
                this.log(`WebSocket connection opened`, { readyState: wsClient.readyState });
                
                // First send the connection initialization message
                this.log(`Sending connection initialization message`, initMessage);
                wsClient.send(JSON.stringify(initMessage));
                
                // Then send the subscription after a short delay
                setTimeout(() => {
                    this.log(`Sending subscription message`, subscriptionMsg);
                    wsClient.send(JSON.stringify(subscriptionMsg));
                }, 500);
            };
            
            // Handle WebSocket messages
            wsClient.onmessage = (event) => {
                try {
                    this.log(`Received WebSocket message:`, event.data);
                    const data = JSON.parse(event.data);
                    
                    // Check for connection acknowledgment
                    if (data.type === 'connection_ack') {
                        this.log(`Connection acknowledged, subscription ready`);
                    }
                    
                    // Check for subscription response
                    if (data.type === 'data' && data.payload && data.payload.data) {
                        const paymentStatus = data.payload.data.lnInvoicePaymentStatusByPaymentRequest;
                        this.log(`Received payment status update`, paymentStatus);
                        
                        if (paymentStatus && paymentStatus.status === 'PAID') {
                            this.log(`Payment confirmed via WebSocket! 🎉`);
                            this.handlePaymentSuccess();
                            wsClient.close();
                        }
                    }
                } catch (error) {
                    this.log(`Error processing WebSocket message: ${error.message}`, error);
                    console.error('Error processing WebSocket message:', error);
                }
            };
            
            // Handle WebSocket errors
            wsClient.onerror = (error) => {
                this.log(`WebSocket error`, error);
                console.error('WebSocket error:', error);
                
                // Fall back to polling as backup if WebSocket fails
                this.log(`Falling back to polling due to WebSocket error`);
                this.pollPaymentStatus(paymentRequest);
            };
            
            // Handle WebSocket closure
            wsClient.onclose = (event) => {
                this.log(`WebSocket connection closed`, { code: event.code, reason: event.reason });
                console.log('WebSocket connection closed');
            };
            
            // Add a timeout to fall back to polling if no updates received
            setTimeout(() => {
                if (wsClient.readyState === WebSocket.OPEN) {
                    this.log(`No WebSocket updates received after timeout, falling back to polling`);
                    this.pollPaymentStatus(paymentRequest);
                }
            }, 10000);
        },
        
        // Polling fallback for payment status
        pollPaymentStatus: function(paymentRequest) {
            this.log(`Starting payment status polling for invoice`);
            const checkPaymentStatus = async () => {
                try {
                    const query = `
                        query CheckPaymentStatus($input: LnInvoicePaymentStatusInput!) {
                            lnInvoicePaymentStatus(input: $input) {
                                status
                            }
                        }
                    `;
                    
                    const variables = {
                        input: {
                            paymentRequest: paymentRequest
                        }
                    };
                    
                    this.log(`Polling API for payment status`);
                    const response = await fetch('https://api.blink.sv/graphql', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            query,
                            variables
                        })
                    });
                    
                    const data = await response.json();
                    this.log(`Poll response received`, data);
                    
                    if (data.data && data.data.lnInvoicePaymentStatus) {
                        const status = data.data.lnInvoicePaymentStatus.status;
                        this.log(`Payment status: ${status}`);
                        
                        if (status === 'PAID') {
                            this.log(`Payment confirmed via polling! 🎉`);
                            this.handlePaymentSuccess();
                            return; // Stop polling
                        }
                    }
                    
                    // Continue polling if not yet paid
                    this.log(`Payment not confirmed yet, polling again in 2 seconds`);
                    setTimeout(checkPaymentStatus, 2000);
                    
                } catch (error) {
                    this.log(`Error polling for payment status: ${error.message}`, error);
                    console.error('Error checking payment status:', error);
                    setTimeout(checkPaymentStatus, 5000); // Retry with longer interval on error
                }
            };
            
            // Start polling
            checkPaymentStatus();
        },
        
        // Handle successful payment
        handlePaymentSuccess: function() {
            this.log(`Handling successful payment`);
            
            // Show success icon
            const successContainer = document.getElementById('blink-pay-success');
            const qrContainer = document.getElementById('blink-pay-qr');
            const amountInput = document.getElementById('blink-pay-amount');
            
            // Hide QR code and amount input
            qrContainer.style.display = 'none';
            amountInput.parentElement.style.display = 'none';
            
            // Show success icon
            successContainer.style.display = 'flex';
            
            // Reset the donation form
            const donateButton = document.getElementById('blink-pay-button');
            
            // Update button text and style
            donateButton.textContent = this.t('paymentSuccessful');
            donateButton.classList.add('success');
            
            // Clear status as the message is now in the button
            this.showStatus('', '');
            
            // Remove all event listeners
            const newButton = donateButton.cloneNode(true);
            donateButton.parentNode.replaceChild(newButton, donateButton);
            
            // Add new event listener to reset the widget
            newButton.addEventListener('click', () => {
                // Reset the widget back to initial state
                successContainer.style.display = 'none';
                newButton.textContent = this.t('buttonText');
                newButton.classList.remove('success');
                
                // Show input field again
                amountInput.parentElement.style.display = 'flex';
                
                // Remove all event listeners again
                const resetButton = newButton.cloneNode(true);
                newButton.parentNode.replaceChild(resetButton, newButton);
                
                // Add the donate event listener back
                resetButton.addEventListener('click', this.handleDonate.bind(this));
                
                // Clear the status
                this.showStatus('', '');
            });
        },
        
        // Set the loading state of the button
        setButtonLoading: function(isLoading) {
            const button = document.getElementById('blink-pay-button');
            if (isLoading) {
                button.innerHTML = `<span class="blink-pay-spinner"></span> ${this.t('loading')}`;
                button.disabled = true;
            } else {
                button.disabled = false;
            }
        },
        
        // Show a status message
        showStatus: function(type, message) {
            const statusEl = document.getElementById('blink-pay-status');
            if (!statusEl) return;
            
            statusEl.className = 'blink-pay-status';
            if (type && message) {
                statusEl.textContent = message;
                statusEl.classList.add(type);
                statusEl.style.display = 'block';
                this.log(`Status message: [${type}] ${message}`);
            } else {
                statusEl.textContent = '';
                statusEl.style.display = 'none';
            }
        },
        
        // Utility to adjust color brightness
        adjustColor: function(hex, percent) {
            let r = parseInt(hex.substring(1, 3), 16);
            let g = parseInt(hex.substring(3, 5), 16);
            let b = parseInt(hex.substring(5, 7), 16);
            
            r = Math.max(0, Math.min(255, r + percent));
            g = Math.max(0, Math.min(255, g + percent));
            b = Math.max(0, Math.min(255, b + percent));
            
            return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        }
    };
    
    // Expose to global scope
    window.BlinkPayButton = BlinkPayButton;
})(); 
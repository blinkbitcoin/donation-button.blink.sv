/**
 * Blink Pay Button Widget
 * A simple widget for accepting Bitcoin Lightning donations via Blink wallet
 */
(function() {
    // Widget configuration
    const BlinkPayButton = {
        // Initialize the widget with the given username and container
        init: function(config) {
            this.username = config.username || '';
            this.containerId = config.containerId || 'blink-pay-button-container';
            this.buttonText = config.buttonText || 'Donate Bitcoin';
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
        
        // Fetch exchange rate for any currency from Blink API
        fetchExchangeRate: async function(currency) {
            const currencyCode = currency.toUpperCase();
            
            const query = `
                query Query($currency: DisplayCurrency) {
                    realtimePrice(currency: $currency) {
                        btcSatPrice {
                            base
                            offset
                        }
                    }
                }
            `;
            
            const variables = {
                currency: currencyCode
            };
            
            try {
                this.log(`Fetching exchange rate for ${currencyCode} from Blink API`);
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
                this.log(`Exchange rate API response for ${currencyCode}`, data);
                
                if (data.errors) {
                    throw new Error(data.errors[0].message || `Error fetching exchange rate for ${currencyCode}`);
                }
                
                const priceData = data.data.realtimePrice.btcSatPrice;
                // Calculate: base / 10^offset = price of 1 sat in cents, so divide by 100 for currency units
                const satPriceInCents = priceData.base / Math.pow(10, priceData.offset);
                const satPriceInCurrency = satPriceInCents / 100;
                // Exchange rate: currency to sats (1 currency unit = X sats)
                const exchangeRate = 1 / satPriceInCurrency;
                
                // Cache the exchange rate
                this.exchangeRates[currency.toLowerCase()] = exchangeRate;
                
                this.log(`Exchange rate calculated: 1 ${currencyCode} = ${exchangeRate.toFixed(2)} sats`);
                
            } catch (error) {
                this.log(`Error fetching exchange rate for ${currencyCode}: ${error.message}`, error);
                console.error('Error fetching exchange rate:', error);
                this.showStatus('error', `Failed to fetch exchange rate for ${currencyCode}. Please try again.`);
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
        
        // Handle the donate button click
        handleDonate: async function() {
            const amountInput = document.getElementById('blink-pay-amount');
            const inputAmount = parseFloat(amountInput.value);
            
            // Validate input
            if (isNaN(inputAmount) || inputAmount <= 0) {
                this.showStatus('error', 'Please enter a valid amount');
                return;
            }
            
            // Check minimum amount based on currency
            const currency = this.supportedCurrencies.find(c => c.code.toLowerCase() === this.selectedCurrency);
            if (currency && currency.isCrypto) {
                if (inputAmount < this.minAmount) {
                    this.showStatus('error', `Amount must be at least ${this.minAmount} sats`);
                    return;
                }
            } else {
                if (inputAmount < 0.01) {
                    this.showStatus('error', `Amount must be at least 0.01 ${this.selectedCurrency.toUpperCase()}`);
                    return;
                }
            }
            
            this.showStatus('', '');
            this.setButtonLoading(true);
            
            try {
                // Convert to sats if needed
                let amountInSats;
                if (this.selectedCurrency === 'sats') {
                    amountInSats = Math.round(inputAmount);
                } else {
                    // Ensure we have exchange rate for fiat currencies
                    if (!this.exchangeRates[this.selectedCurrency]) {
                        this.log(`Exchange rate for ${this.selectedCurrency.toUpperCase()} not available, fetching...`);
                        await this.fetchExchangeRate(this.selectedCurrency);
                    }
                    amountInSats = this.convertToSats(inputAmount);
                }
                
                this.log(`Starting donation process for ${inputAmount} ${this.selectedCurrency.toUpperCase()} (${amountInSats} sats)`);
                
                // Step 1: Get the account default wallet ID
                this.log(`Getting wallet ID for username: ${this.username}`);
                const walletId = await this.getAccountDefaultWalletId(this.username);
                if (!walletId) {
                    throw new Error('Could not retrieve wallet ID for this username');
                }
                this.log(`Received wallet ID: ${walletId}`);
                
                // Step 2: Create an invoice
                this.log(`Creating invoice for ${amountInSats} sats to wallet ${walletId}`);
                const invoice = await this.createInvoice(walletId, amountInSats);
                if (!invoice) {
                    throw new Error('Could not create invoice');
                }
                this.log(`Invoice created successfully`, { paymentRequest: invoice.substring(0, 30) + '...' });
                
                // Step 3: Display the payment request and QR code
                this.displayInvoice(invoice);
                
                // Step 4: Subscribe to payment status updates
                this.log(`Setting up payment status monitoring`);
                this.subscribeToPaymentStatus(invoice);
                
            } catch (error) {
                this.log(`Error in donation process: ${error.message}`, error);
                console.error('Blink Pay Button Error:', error);
                this.showStatus('error', error.message || 'An error occurred while processing your donation');
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
            qrImage.alt = 'Lightning Invoice QR Code';
            qrContainer.innerHTML = '';
            qrContainer.appendChild(qrImage);
            qrContainer.style.display = 'flex';
            
            // Update the button for copy to clipboard functionality
            const donateButton = document.getElementById('blink-pay-button');
            donateButton.textContent = 'Copy Invoice';
            
            // Remove all existing event listeners by cloning and replacing the button
            const newButton = donateButton.cloneNode(true);
            donateButton.parentNode.replaceChild(newButton, donateButton);
            
            // Add new event listener for copying the invoice
            newButton.addEventListener('click', () => {
                navigator.clipboard.writeText(paymentRequest).then(() => {
                    this.showStatus('success', 'Invoice copied to clipboard');
                    
                    // Change button text temporarily to show success
                    newButton.textContent = 'Copied!';
                    setTimeout(() => {
                        newButton.textContent = 'Copy Invoice';
                    }, 1500);
                    
                }).catch(err => {
                    console.error('Could not copy invoice: ', err);
                    this.showStatus('error', 'Failed to copy invoice');
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
            donateButton.textContent = 'Payment Successful. Thank you for donating.';
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
                newButton.textContent = this.buttonText;
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
                button.innerHTML = '<span class="blink-pay-spinner"></span> Loading...';
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
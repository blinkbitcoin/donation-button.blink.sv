/**
 * Blink Pay Button Generator
 * Generates embeddable code for a Bitcoin Lightning donation button
 */
document.addEventListener('DOMContentLoaded', function() {
    const blinkUsernameInput = document.getElementById('blinkUsername');
    const generateBtn = document.getElementById('generateBtn');
    const resultContainer = document.getElementById('result-container');
    const generatedCodeElement = document.getElementById('generatedCode');
    const copyBtn = document.getElementById('copyBtn');
    const widgetPreview = document.getElementById('widget-preview');
    const themeToggle = document.getElementById('theme-toggle');
    const currencyInput = document.getElementById('currencyInput');
    const currencyValidation = document.getElementById('currencyValidation');
    const languageSelect = document.getElementById('languageSelect');
    const buttonWidthInput = document.getElementById('buttonWidth');
    
    let currentWidgetTheme = 'light';
    let currentUsername = '';
    let selectedCurrencies = ['USD']; // Default to USD + sats (sats is always included)
    let selectedLanguage = 'en'; // Default language
    let currentButtonWidth = null; // Custom button width in pixels
    
    // Common currencies that are well-supported by most APIs
    const popularCurrencies = [
        'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY',
        'ZAR', 'BRL', 'MXN', 'INR', 'KRW', 'SGD', 'THB', 'PHP',
        'NGN', 'KES', 'GHS', 'UGX', 'TZS', 'RWF', 'ETB',
        'NOK', 'SEK', 'DKK', 'PLN', 'CZK', 'HUF', 'TRY', 'ILS', 'AED', 'SAR'
    ];
    
    // Available languages for the widget
    const availableLanguages = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Español' },
        { code: 'fr', name: 'Français' },
        { code: 'de', name: 'Deutsch' },
        { code: 'pt', name: 'Português' },
        { code: 'it', name: 'Italiano' },
        { code: 'ja', name: '日本語' },
        { code: 'zh', name: '中文' },
        { code: 'ru', name: 'Русский' },
        { code: 'ar', name: 'العربية' },
        { code: 'tr', name: 'Türkçe' },
        // European Languages
        { code: 'nl', name: 'Nederlands' },
        { code: 'da', name: 'Dansk' },
        { code: 'sv', name: 'Svenska' },
        { code: 'el', name: 'Ελληνικά' },
        { code: 'ro', name: 'Română' },
        { code: 'hu', name: 'Magyar' },
        { code: 'hr', name: 'Hrvatski' },
        { code: 'sr', name: 'Српски' },
        { code: 'bs', name: 'Bosanski' },
        { code: 'cs', name: 'Čeština' },
        { code: 'pl', name: 'Polski' },
        { code: 'lt', name: 'Lietuvių' },
        { code: 'fi', name: 'Suomi' },
        { code: 'sq', name: 'Shqip' },
        // African Languages
        { code: 'sw', name: 'Kiswahili' },
        { code: 'af', name: 'Afrikaans' },
        { code: 'xh', name: 'isiXhosa' },
        { code: 'zu', name: 'isiZulu' },
        // Asian Languages
        { code: 'id', name: 'Bahasa Indonesia' },
        { code: 'th', name: 'ไทย' },
        { code: 'vi', name: 'Tiếng Việt' },
        { code: 'hi', name: 'हिन्दी' },
        { code: 'bn', name: 'বাংলা' },
        { code: 'fa', name: 'فارسی' },
        { code: 'ps', name: 'پښتو' }
    ];
    
    // Toggle site theme between light and dark
    themeToggle.addEventListener('click', function() {
        const body = document.body;
        const headerLogo = document.getElementById('header-logo');
        const isCurrentlyDark = body.classList.contains('dark-mode');
        
        if (isCurrentlyDark) {
            body.classList.remove('dark-mode');
            body.classList.add('light-mode');
            themeToggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-moon" viewBox="0 0 16 16"><path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"/></svg>';
            if (headerLogo) {
                headerLogo.src = 'img/blink-light.svg';
            }
        } else {
            body.classList.remove('light-mode');
            body.classList.add('dark-mode');
            themeToggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-sun" viewBox="0 0 16 16"><path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/></svg>';
            if (headerLogo) {
                headerLogo.src = 'img/blink-dark.svg';
            }
        }
    });
    
    // Populate language dropdown dynamically
    function populateLanguageDropdown() {
        languageSelect.innerHTML = '';
        availableLanguages.forEach(language => {
            const option = document.createElement('option');
            option.value = language.code;
            option.textContent = language.name;
            languageSelect.appendChild(option);
        });
    }
    
    // Initialize language dropdown on page load
    populateLanguageDropdown();
    
    // Initialize theme selection visual feedback
    updateThemeSelection();
    
    // Listen for widget theme changes
    document.querySelectorAll('input[name="widget-theme"]').forEach(radio => {
        radio.addEventListener('change', function() {
            currentWidgetTheme = this.value;
            updateThemeSelection();
            updateWidgetPreview();
            updateGeneratedCode();
        });
    });
    
    // Function to update visual feedback for theme selection
    function updateThemeSelection() {
        // Remove selected class from all labels
        document.querySelectorAll('.mode-options label').forEach(label => {
            label.classList.remove('selected');
        });
        
        // Add selected class to the currently selected theme's label
        const selectedRadio = document.querySelector(`input[name="widget-theme"][value="${currentWidgetTheme}"]`);
        if (selectedRadio) {
            selectedRadio.parentElement.classList.add('selected');
        }
    }

    // Listen for currency input changes
    currencyInput.addEventListener('input', function() {
        updateSelectedCurrencies();
        validateCurrencies();
        updateWidgetPreview();
        updateGeneratedCode();
    });
    
    // Listen for language selection changes
    languageSelect.addEventListener('change', function() {
        selectedLanguage = this.value;
        updateWidgetPreview();
        updateGeneratedCode();
    });
    
    // Update selected currencies array based on text input
    function updateSelectedCurrencies() {
        const inputValue = currencyInput.value.trim();
        if (!inputValue) {
            selectedCurrencies = [];
            return;
        }
        
        // Split by comma, clean up each currency code
        selectedCurrencies = inputValue
            .split(',')
            .map(currency => currency.trim().toUpperCase())
            .filter(currency => currency.length > 0);
    }
    
    // Validate currency codes and show feedback
    function validateCurrencies() {
        if (selectedCurrencies.length === 0) {
            currencyValidation.innerHTML = '';
            return;
        }
        
        const validCurrencies = [];
        const unknownCurrencies = [];
        
        selectedCurrencies.forEach(currency => {
            if (popularCurrencies.includes(currency)) {
                validCurrencies.push(currency);
            } else {
                unknownCurrencies.push(currency);
            }
        });
        
        let validationHtml = '';
        
        if (validCurrencies.length > 0) {
            validationHtml += `<small class="text-success">✓ Supported: ${validCurrencies.join(', ')}</small>`;
        }
        
        if (unknownCurrencies.length > 0) {
            validationHtml += `${validCurrencies.length > 0 ? '<br>' : ''}<small class="text-warning">⚠ Unknown (will attempt): ${unknownCurrencies.join(', ')}</small>`;
            validationHtml += `<br><small class="text-muted">Unknown currencies may work if supported by Blink API</small>`;
        }
        
        currencyValidation.innerHTML = validationHtml;
    }

    // Generate currency configuration for the widget
    function generateCurrencyConfig() {
        const currencies = [
            { code: 'sats', name: 'sats', isCrypto: true }
        ];
        
        selectedCurrencies.forEach(currencyCode => {
            currencies.push({
                code: currencyCode,
                name: currencyCode,
                isCrypto: false
            });
        });
        
        return currencies;
    }

    // Check if username exists in Blink
    async function checkUsernameExists(username) {
        const query = `
            query Query($username: Username!) {
                usernameAvailable(username: $username)
            }
        `;
        
        const variables = {
            username: username
        };
        
        try {
            const response = await fetch('https://api.blink.sv/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: query,
                    variables: variables
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.errors) {
                // Check for invalid username format error
                const errorMessage = data.errors[0].message;
                if (errorMessage.includes('Invalid value for Username')) {
                    throw new Error('INVALID_USERNAME_FORMAT');
                }
                throw new Error(errorMessage);
            }
            
            // usernameAvailable: true means username does NOT exist
            // usernameAvailable: false means username DOES exist
            return !data.data.usernameAvailable;
            
        } catch (error) {
            console.error('Error checking username:', error);
            // Re-throw specific errors to be handled in generateCode
            if (error.message === 'INVALID_USERNAME_FORMAT') {
                throw error;
            }
            // On other errors, allow generation to proceed (assume username exists)
            return true;
        }
    }
    
    // Show username validation feedback
    function showUsernameValidation(message, isError = false) {
        // Remove any existing validation message
        const existingValidation = document.getElementById('username-validation');
        if (existingValidation) {
            existingValidation.remove();
        }
        
        // Create validation message element
        const validationDiv = document.createElement('div');
        validationDiv.id = 'username-validation';
        validationDiv.className = `form-text mt-2 ${isError ? 'text-danger' : 'text-success'}`;
        validationDiv.innerHTML = message;
        
        // Insert after the input group
        const inputGroup = blinkUsernameInput.parentElement;
        inputGroup.parentElement.insertBefore(validationDiv, inputGroup.nextSibling);
    }

    // Generate code based on the username
    async function generateCode() {
        currentUsername = blinkUsernameInput.value.trim();
        
        if (!currentUsername) {
            alert('Please enter your Blink username');
            return;
        }
        
        // Disable generate button and show loading state
        generateBtn.disabled = true;
        generateBtn.textContent = 'Checking...';
        
        try {
            // Check if username exists
            const usernameExists = await checkUsernameExists(currentUsername);
            
            if (!usernameExists) {
                // Username doesn't exist - show error and prevent generation
                showUsernameValidation(
                    'This Blink username does not exist yet. <a href="https://get.blink.sv" target="_blank" style="color: var(--blink-orange);">Download Blink now</a> and get it for yourself!',
                    true
                );
                return;
            }
            
            // Username exists - show success message
            showUsernameValidation('✓ Blink username found!', false);
        
        // Update selected currencies
        updateSelectedCurrencies();
        validateCurrencies();
        
        // Show the result container
        resultContainer.style.display = 'block';
        
        // Update generated code and preview
        updateGeneratedCode();
        updateWidgetPreview();
        
        // Scroll to the results
        setTimeout(() => {
            resultContainer.scrollIntoView({ behavior: 'smooth' });
        }, 300);
            
        } catch (error) {
            console.error('Error during code generation:', error);
            
            if (error.message === 'INVALID_USERNAME_FORMAT') {
                showUsernameValidation('Invalid username format. Please enter a valid Blink username without special characters or domains.', true);
            } else {
                showUsernameValidation('Error checking username. Please try again.', true);
            }
        } finally {
            // Re-enable generate button
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate Code';
        }
    }
    
    // Update the generated code based on current settings
    function updateGeneratedCode() {
        const currencyConfig = generateCurrencyConfig();
        const currencyConfigString = JSON.stringify(currencyConfig, null, 8).replace(/\n/g, '\n        ');
        
        // Generate button width configuration
        const buttonWidthConfig = currentButtonWidth ? `\n        buttonWidth: ${currentButtonWidth},` : '';
        
        // Generate the HTML code for embedding with the domain
        const generatedCode = `<!-- Blink Pay Button widget -->
<div id="blink-pay-button-container"></div>

<!-- Blink Pay Button script -->
        <script src="https://blinkbitcoin.github.io/donation-button.blink.sv/js/blink-pay-button.js"></script>
<script>
  // Initialize widget when script is loaded
  function initBlinkWidget() {
    if (typeof BlinkPayButton !== 'undefined') {
      BlinkPayButton.init({
        username: '${currentUsername}',
        containerId: 'blink-pay-button-container',
        themeMode: '${currentWidgetTheme}',
        language: '${selectedLanguage}',
        defaultAmount: 1000,${buttonWidthConfig}
        supportedCurrencies: ${currencyConfigString},
        debug: false
      });
    } else {
      // Try again in 100ms if BlinkPayButton isn't loaded yet
      setTimeout(initBlinkWidget, 100);
    }
  }
  
  // Initialize when DOM is ready or now if already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBlinkWidget);
  } else {
    initBlinkWidget();
  }
</script>`;
        
        // Populate the code element
        generatedCodeElement.textContent = generatedCode;
    }
    
    // Update the widget preview with current settings
    function updateWidgetPreview() {
        // Clear previous preview completely
        widgetPreview.innerHTML = '<div id="blink-pay-button-container"></div>';
        
        // Add debug info
        const debugInfo = document.createElement('div');
        debugInfo.style.cssText = 'font-size: 12px; color: #666; text-align: center; margin-top: 10px; font-family: monospace;';
        debugInfo.textContent = `Widget Width: ${currentButtonWidth ? currentButtonWidth + 'px' : 'Responsive (370px max)'}`;
        widgetPreview.appendChild(debugInfo);
        
        // Check if BlinkPayButton is already loaded
        if (window.BlinkPayButton) {
            // Force a new widget initialization with delay
            setTimeout(() => {
                const currencyConfig = generateCurrencyConfig();
                
                window.BlinkPayButton.init({
                    username: currentUsername,
                    containerId: 'blink-pay-button-container',
                    themeMode: currentWidgetTheme,
                    language: selectedLanguage,
                    defaultAmount: 1000,
                    buttonWidth: currentButtonWidth,
                    supportedCurrencies: currencyConfig,
                    debug: true
                });
                
                // Update debug info after initialization
                setTimeout(() => {
                    const widget = document.querySelector('#blink-pay-button-container .blink-pay-widget');
                    const button = document.querySelector('#blink-pay-button-container .blink-pay-button');
                    if (widget && button) {
                        const widgetWidth = widget.offsetWidth;
                        const buttonWidth = button.offsetWidth;
                        const maxWidth = getComputedStyle(button).maxWidth;
                        debugInfo.textContent = `Widget Width: ${currentButtonWidth ? currentButtonWidth + 'px' : 'Responsive (370px max)'} | Widget: ${widgetWidth}px | Button: ${buttonWidth}px`;
                    }
                }, 1000);
            }, 50);
        } else {
            // Load the widget script dynamically for the preview
            const script = document.createElement('script');
            script.src = 'js/blink-pay-button.js';
            document.head.appendChild(script);
            
            // Initialize the widget once the script is loaded
            script.onload = function() {
                setTimeout(() => {
                    const currencyConfig = generateCurrencyConfig();
                    
                    window.BlinkPayButton.init({
                        username: currentUsername,
                        containerId: 'blink-pay-button-container',
                        themeMode: currentWidgetTheme,
                        language: selectedLanguage,
                        defaultAmount: 1000,
                        buttonWidth: currentButtonWidth,
                        supportedCurrencies: currencyConfig,
                        debug: true
                    });
                    
                    // Update debug info after initialization
                    setTimeout(() => {
                        const widget = document.querySelector('#blink-pay-button-container .blink-pay-widget');
                        const button = document.querySelector('#blink-pay-button-container .blink-pay-button');
                        if (widget && button) {
                            const widgetWidth = widget.offsetWidth;
                            const buttonWidth = button.offsetWidth;
                            const maxWidth = getComputedStyle(button).maxWidth;
                            debugInfo.textContent = `Widget Width: ${currentButtonWidth ? currentButtonWidth + 'px' : 'Responsive (370px max)'} | Widget: ${widgetWidth}px | Button: ${buttonWidth}px`;
                        }
                    }, 1000);
                }, 50);
            };
        }
    }
    
    // Copy the generated code to clipboard
    function copyToClipboard() {
        const codeText = generatedCodeElement.textContent;
        
        navigator.clipboard.writeText(codeText)
            .then(() => {
                // Show success feedback
                copyBtn.innerText = 'Copied!';
                copyBtn.classList.add('btn-success');
                copyBtn.classList.remove('btn-outline-secondary');
                
                // Reset after 2 seconds
                setTimeout(() => {
                    copyBtn.innerText = 'Copy';
                    copyBtn.classList.remove('btn-success');
                    copyBtn.classList.add('btn-outline-secondary');
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
                alert('Failed to copy to clipboard');
            });
    }
    
    // Event listeners
    generateBtn.addEventListener('click', () => generateCode());
    copyBtn.addEventListener('click', copyToClipboard);
    
    // Allow Enter key to trigger generation
    blinkUsernameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            generateCode();
        }
    });
    
    // Button width input event listener
    buttonWidthInput.addEventListener('input', function() {
        const value = parseInt(this.value);
        currentButtonWidth = value && value >= 200 && value <= 500 ? value : null;
        updateWidgetPreview();
    });
}); 
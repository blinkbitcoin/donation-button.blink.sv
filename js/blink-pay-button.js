/**
 * Blink Pay Button Widget
 * A simple widget for accepting Bitcoin Lightning donations via Blink wallet
 * Version: 1.2.3 - Reduced button font size by 2pts for better appearance
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
        },
        tr: {
            buttonText: 'Bitcoin Bağışla',
            copyInvoice: 'Faturayı Kopyala',
            copied: 'Kopyalandı!',
            paymentSuccessful: 'Ödeme Başarılı. Bağışınız için teşekkürler.',
            loading: 'Yükleniyor...',
            invoiceCopied: 'Fatura panoya kopyalandı',
            failedToCopy: 'Fatura kopyalanamadı',
            pleaseEnterValidAmount: 'Lütfen geçerli bir miktar girin',
            amountMustBeAtLeast: 'Miktar en az olmalıdır',
            failedToFetchExchangeRate: 'Döviz kuru alınamadı',
            pleaseTryAgain: 'Lütfen tekrar deneyin.',
            anErrorOccurred: 'Bağışınız işlenirken bir hata oluştu',
            qrCodeAlt: 'Lightning Fatura QR Kodu'
        },
        // European Languages
        nl: {
            buttonText: 'Doneer Bitcoin',
            copyInvoice: 'Factuur Kopiëren',
            copied: 'Gekopieerd!',
            paymentSuccessful: 'Betaling Succesvol. Bedankt voor je donatie.',
            loading: 'Laden...',
            invoiceCopied: 'Factuur gekopieerd naar klembord',
            failedToCopy: 'Factuur kopiëren mislukt',
            pleaseEnterValidAmount: 'Voer een geldig bedrag in',
            amountMustBeAtLeast: 'Bedrag moet minstens zijn',
            failedToFetchExchangeRate: 'Wisselkoers ophalen mislukt voor',
            pleaseTryAgain: 'Probeer opnieuw.',
            anErrorOccurred: 'Er is een fout opgetreden bij het verwerken van je donatie',
            qrCodeAlt: 'Lightning Factuur QR Code'
        },
        da: {
            buttonText: 'Doner Bitcoin',
            copyInvoice: 'Kopier Faktura',
            copied: 'Kopieret!',
            paymentSuccessful: 'Betaling Succesfuld. Tak for din donation.',
            loading: 'Indlæser...',
            invoiceCopied: 'Faktura kopieret til udklipsholder',
            failedToCopy: 'Kunne ikke kopiere faktura',
            pleaseEnterValidAmount: 'Indtast venligst et gyldigt beløb',
            amountMustBeAtLeast: 'Beløb skal være mindst',
            failedToFetchExchangeRate: 'Kunne ikke hente valutakurs for',
            pleaseTryAgain: 'Prøv venligst igen.',
            anErrorOccurred: 'Der opstod en fejl under behandling af din donation',
            qrCodeAlt: 'Lightning Faktura QR Kode'
        },
        sv: {
            buttonText: 'Donera Bitcoin',
            copyInvoice: 'Kopiera Faktura',
            copied: 'Kopierad!',
            paymentSuccessful: 'Betalning Lyckades. Tack för din donation.',
            loading: 'Laddar...',
            invoiceCopied: 'Faktura kopierad till urklipp',
            failedToCopy: 'Kunde inte kopiera faktura',
            pleaseEnterValidAmount: 'Vänligen ange ett giltigt belopp',
            amountMustBeAtLeast: 'Beloppet måste vara minst',
            failedToFetchExchangeRate: 'Kunde inte hämta växelkurs för',
            pleaseTryAgain: 'Vänligen försök igen.',
            anErrorOccurred: 'Ett fel uppstod vid behandling av din donation',
            qrCodeAlt: 'Lightning Faktura QR Kod'
        },
        el: {
            buttonText: 'Δωρίστε Bitcoin',
            copyInvoice: 'Αντιγραφή Τιμολογίου',
            copied: 'Αντιγράφηκε!',
            paymentSuccessful: 'Πληρωμή Επιτυχής. Ευχαριστούμε για τη δωρεά σας.',
            loading: 'Φόρτωση...',
            invoiceCopied: 'Τιμολόγιο αντιγράφηκε στο πρόχειρο',
            failedToCopy: 'Αποτυχία αντιγραφής τιμολογίου',
            pleaseEnterValidAmount: 'Παρακαλώ εισάγετε έγκυρο ποσό',
            amountMustBeAtLeast: 'Το ποσό πρέπει να είναι τουλάχιστον',
            failedToFetchExchangeRate: 'Αποτυχία λήψης συναλλαγματικής ισοτιμίας για',
            pleaseTryAgain: 'Παρακαλώ δοκιμάστε ξανά.',
            anErrorOccurred: 'Προέκυψε σφάλμα κατά την επεξεργασία της δωρεάς σας',
            qrCodeAlt: 'Lightning Τιμολόγιο QR Κώδικας'
        },
        ro: {
            buttonText: 'Donează Bitcoin',
            copyInvoice: 'Copiază Factura',
            copied: 'Copiat!',
            paymentSuccessful: 'Plată Reușită. Mulțumim pentru donația ta.',
            loading: 'Se încarcă...',
            invoiceCopied: 'Factură copiată în clipboard',
            failedToCopy: 'Nu s-a putut copia factura',
            pleaseEnterValidAmount: 'Te rugăm să introduci o sumă validă',
            amountMustBeAtLeast: 'Suma trebuie să fie cel puțin',
            failedToFetchExchangeRate: 'Nu s-a putut obține cursul de schimb pentru',
            pleaseTryAgain: 'Te rugăm să încerci din nou.',
            anErrorOccurred: 'A apărut o eroare în procesarea donației tale',
            qrCodeAlt: 'Lightning Factură QR Cod'
        },
        hu: {
            buttonText: 'Bitcoin Adományozás',
            copyInvoice: 'Számla Másolása',
            copied: 'Másolva!',
            paymentSuccessful: 'Fizetés Sikeres. Köszönjük az adományát.',
            loading: 'Betöltés...',
            invoiceCopied: 'Számla vágólapra másolva',
            failedToCopy: 'Számla másolása sikertelen',
            pleaseEnterValidAmount: 'Kérjük, adjon meg érvényes összeget',
            amountMustBeAtLeast: 'Az összegnek legalább ennyinek kell lennie',
            failedToFetchExchangeRate: 'Árfolyam lekérése sikertelen:',
            pleaseTryAgain: 'Kérjük, próbálja újra.',
            anErrorOccurred: 'Hiba történt az adományának feldolgozása során',
            qrCodeAlt: 'Lightning Számla QR Kód'
        },
        hr: {
            buttonText: 'Doniraj Bitcoin',
            copyInvoice: 'Kopiraj Račun',
            copied: 'Kopirano!',
            paymentSuccessful: 'Plaćanje Uspješno. Hvala na donaciji.',
            loading: 'Učitavanje...',
            invoiceCopied: 'Račun kopiran u međuspremnik',
            failedToCopy: 'Neuspješno kopiranje računa',
            pleaseEnterValidAmount: 'Molimo unesite valjan iznos',
            amountMustBeAtLeast: 'Iznos mora biti najmanje',
            failedToFetchExchangeRate: 'Neuspješno dohvaćanje tečaja za',
            pleaseTryAgain: 'Molimo pokušajte ponovo.',
            anErrorOccurred: 'Došlo je do greške tijekom obrade vaše donacije',
            qrCodeAlt: 'Lightning Račun QR Kod'
        },
        sr: {
            buttonText: 'Дониraj Bitcoin',
            copyInvoice: 'Копираj Рачун',
            copied: 'Копирано!',
            paymentSuccessful: 'Плаћање Успешно. Хвала на донацији.',
            loading: 'Учитавање...',
            invoiceCopied: 'Рачун копиран у клипборд',
            failedToCopy: 'Неуспешно копирање рачуна',
            pleaseEnterValidAmount: 'Молимо унесите важећи износ',
            amountMustBeAtLeast: 'Износ мора бити најмање',
            failedToFetchExchangeRate: 'Неуспешно добијање курса за',
            pleaseTryAgain: 'Молимо покушајте поново.',
            anErrorOccurred: 'Дошло је до грешке током обраде ваше донације',
            qrCodeAlt: 'Lightning Рачун QR Код'
        },
        bs: {
            buttonText: 'Doniraj Bitcoin',
            copyInvoice: 'Kopiraj Račun',
            copied: 'Kopirano!',
            paymentSuccessful: 'Plaćanje Uspješno. Hvala na donaciji.',
            loading: 'Učitavanje...',
            invoiceCopied: 'Račun kopiran u clipboard',
            failedToCopy: 'Neuspješno kopiranje računa',
            pleaseEnterValidAmount: 'Molimo unesite valjan iznos',
            amountMustBeAtLeast: 'Iznos mora biti najmanje',
            failedToFetchExchangeRate: 'Neuspješno dohvatanje kursa za',
            pleaseTryAgain: 'Molimo pokušajte ponovo.',
            anErrorOccurred: 'Došlo je do greške tokom obrade vaše donacije',
            qrCodeAlt: 'Lightning Račun QR Kod'
        },
        cs: {
            buttonText: 'Darovat Bitcoin',
            copyInvoice: 'Kopírovat Fakturu',
            copied: 'Zkopírováno!',
            paymentSuccessful: 'Platba Úspěšná. Děkujeme za váš dar.',
            loading: 'Načítání...',
            invoiceCopied: 'Faktura zkopírována do schránky',
            failedToCopy: 'Nepodařilo se zkopírovat fakturu',
            pleaseEnterValidAmount: 'Prosím zadejte platnou částku',
            amountMustBeAtLeast: 'Částka musí být nejméně',
            failedToFetchExchangeRate: 'Nepodařilo se získat směnný kurz pro',
            pleaseTryAgain: 'Prosím zkuste to znovu.',
            anErrorOccurred: 'Při zpracování vašeho daru došlo k chybě',
            qrCodeAlt: 'Lightning Faktura QR Kód'
        },
        pl: {
            buttonText: 'Przekaż Bitcoin',
            copyInvoice: 'Kopiuj Fakturę',
            copied: 'Skopiowane!',
            paymentSuccessful: 'Płatność Udana. Dziękujemy za darowiznę.',
            loading: 'Ładowanie...',
            invoiceCopied: 'Faktura skopiowana do schowka',
            failedToCopy: 'Nie udało się skopiować faktury',
            pleaseEnterValidAmount: 'Proszę podać prawidłową kwotę',
            amountMustBeAtLeast: 'Kwota musi wynosić co najmniej',
            failedToFetchExchangeRate: 'Nie udało się pobrać kursu wymiany dla',
            pleaseTryAgain: 'Proszę spróbować ponownie.',
            anErrorOccurred: 'Wystąpił błąd podczas przetwarzania darowizny',
            qrCodeAlt: 'Lightning Faktura QR Kod'
        },
        lt: {
            buttonText: 'Paaukoti Bitcoin',
            copyInvoice: 'Kopijuoti Sąskaitą',
            copied: 'Nukopijuota!',
            paymentSuccessful: 'Mokėjimas Sėkmingas. Ačiū už auką.',
            loading: 'Kraunasi...',
            invoiceCopied: 'Sąskaita nukopijuota į iškarpinę',
            failedToCopy: 'Nepavyko nukopijuoti sąskaitos',
            pleaseEnterValidAmount: 'Prašome įvesti galiojančią sumą',
            amountMustBeAtLeast: 'Suma turi būti bent',
            failedToFetchExchangeRate: 'Nepavyko gauti valiutos kurso',
            pleaseTryAgain: 'Prašome bandyti dar kartą.',
            anErrorOccurred: 'Apdorojant jūsų auką įvyko klaida',
            qrCodeAlt: 'Lightning Sąskaitos QR Kodas'
        },
        fi: {
            buttonText: 'Lahjoita Bitcoin',
            copyInvoice: 'Kopioi Lasku',
            copied: 'Kopioitu!',
            paymentSuccessful: 'Maksu Onnistui. Kiitos lahjoituksestasi.',
            loading: 'Ladataan...',
            invoiceCopied: 'Lasku kopioitu leikepöydälle',
            failedToCopy: 'Laskun kopiointi epäonnistui',
            pleaseEnterValidAmount: 'Anna kelvollinen summa',
            amountMustBeAtLeast: 'Summan on oltava vähintään',
            failedToFetchExchangeRate: 'Vaihtokurssin haku epäonnistui',
            pleaseTryAgain: 'Yritä uudelleen.',
            anErrorOccurred: 'Lahjoituksen käsittelyssä tapahtui virhe',
            qrCodeAlt: 'Lightning Lasku QR Koodi'
        },
        sq: {
            buttonText: 'Dhuro Bitcoin',
            copyInvoice: 'Kopjo Faturën',
            copied: 'U kopjua!',
            paymentSuccessful: 'Pagesa e Suksesshme. Faleminderit për dhurimin.',
            loading: 'Po ngarkohet...',
            invoiceCopied: 'Fatura u kopjua në clipboard',
            failedToCopy: 'Dështoi kopjimi i faturës',
            pleaseEnterValidAmount: 'Ju lutemi shkruani një shumë të vlefshme',
            amountMustBeAtLeast: 'Shuma duhet të jetë të paktën',
            failedToFetchExchangeRate: 'Dështoi marrja e kursit të këmbimit për',
            pleaseTryAgain: 'Ju lutemi provoni përsëri.',
            anErrorOccurred: 'Ndodhi një gabim gjatë përpunimit të dhurimit tuaj',
            qrCodeAlt: 'Lightning Faturë QR Kod'
        },
        // African Languages
        sw: {
            buttonText: 'Changia Bitcoin',
            copyInvoice: 'Nakili Bili',
            copied: 'Imenakiliwa!',
            paymentSuccessful: 'Malipo Yamefanikiwa. Asante kwa mchango wako.',
            loading: 'Inapakia...',
            invoiceCopied: 'Bili imenakiliwa kwenye clipboard',
            failedToCopy: 'Imeshindwa kunakili bili',
            pleaseEnterValidAmount: 'Tafadhali weka kiasi halali',
            amountMustBeAtLeast: 'Kiasi lazima kiwe angalau',
            failedToFetchExchangeRate: 'Imeshindwa kupata kiwango cha ubadilishaji kwa',
            pleaseTryAgain: 'Tafadhali jaribu tena.',
            anErrorOccurred: 'Hitilafu imetokea wakati wa kuchakata mchango wako',
            qrCodeAlt: 'Lightning Bili QR Msimbo'
        },
        af: {
            buttonText: 'Skenk Bitcoin',
            copyInvoice: 'Kopieer Faktuur',
            copied: 'Gekopieer!',
            paymentSuccessful: 'Betaling Geslaagd. Dankie vir jou skenking.',
            loading: 'Laai...',
            invoiceCopied: 'Faktuur na knipbord gekopieer',
            failedToCopy: 'Kon nie faktuur kopieer nie',
            pleaseEnterValidAmount: 'Voer asseblief \'n geldige bedrag in',
            amountMustBeAtLeast: 'Bedrag moet ten minste wees',
            failedToFetchExchangeRate: 'Kon nie wisselkoers kry vir',
            pleaseTryAgain: 'Probeer asseblief weer.',
            anErrorOccurred: 'Daar het \'n fout voorgekom tydens verwerking van jou skenking',
            qrCodeAlt: 'Lightning Faktuur QR Kode'
        },
        xh: {
            buttonText: 'Nikela Bitcoin',
            copyInvoice: 'Khuphela Ityala',
            copied: 'Kukhutshelwe!',
            paymentSuccessful: 'Intlawulo Iphumelele. Enkosi ngomnikelo wakho.',
            loading: 'Kulayishwa...',
            invoiceCopied: 'Ityala likhutshelwe kwi-clipboard',
            failedToCopy: 'Akuphumelelanga ukukhuphela ityala',
            pleaseEnterValidAmount: 'Nceda ufake imali esemthethweni',
            amountMustBeAtLeast: 'Imali kufuneka ibe yintoni ubuncinci',
            failedToFetchExchangeRate: 'Akuphumelelanga ukufumana ireyithi yotshintshiselwano',
            pleaseTryAgain: 'Nceda uzame kwakhona.',
            anErrorOccurred: 'Kwenzeke impazamo ngexesha lokusetyenzwa komnikelo wakho',
            qrCodeAlt: 'Lightning Ityala QR Ikhowudi'
        },
        zu: {
            buttonText: 'Nikela Bitcoin',
            copyInvoice: 'Kopisha I-invoice',
            copied: 'Kukopishelwe!',
            paymentSuccessful: 'Inkokhelo Iphumelele. Siyabonga ngomnikelo wakho.',
            loading: 'Kulayishwa...',
            invoiceCopied: 'I-invoice ikopishelwe ku-clipboard',
            failedToCopy: 'Yehluleka ukukopisha i-invoice',
            pleaseEnterValidAmount: 'Sicela ufake inani elivumelekile',
            amountMustBeAtLeast: 'Inani kumele libe okungenani',
            failedToFetchExchangeRate: 'Yehluleka ukuthola izinga lokushintshana',
            pleaseTryAgain: 'Sicela uzame futhi.',
            anErrorOccurred: 'Kube khona iphutha ngesikhathi sokucubungula umnikelo wakho',
            qrCodeAlt: 'Lightning I-invoice QR Ikhodi'
        },
        // Asian Languages
        id: {
            buttonText: 'Donasi Bitcoin',
            copyInvoice: 'Salin Invoice',
            copied: 'Tersalin!',
            paymentSuccessful: 'Pembayaran Berhasil. Terima kasih atas donasi Anda.',
            loading: 'Memuat...',
            invoiceCopied: 'Invoice tersalin ke clipboard',
            failedToCopy: 'Gagal menyalin invoice',
            pleaseEnterValidAmount: 'Harap masukkan jumlah yang valid',
            amountMustBeAtLeast: 'Jumlah harus setidaknya',
            failedToFetchExchangeRate: 'Gagal mengambil nilai tukar untuk',
            pleaseTryAgain: 'Silakan coba lagi.',
            anErrorOccurred: 'Terjadi kesalahan saat memproses donasi Anda',
            qrCodeAlt: 'Lightning Invoice QR Code'
        },
        th: {
            buttonText: 'บริจาค Bitcoin',
            copyInvoice: 'คัดลอกใบแจ้งหนี้',
            copied: 'คัดลอกแล้ว!',
            paymentSuccessful: 'การชำระเงินสำเร็จ ขอบคุณสำหรับการบริจาค',
            loading: 'กำลังโหลด...',
            invoiceCopied: 'ใบแจ้งหนี้ถูกคัดลอกไปยังคลิปบอร์ด',
            failedToCopy: 'ไม่สามารถคัดลอกใบแจ้งหนี้ได้',
            pleaseEnterValidAmount: 'กรุณาใส่จำนวนเงินที่ถูกต้อง',
            amountMustBeAtLeast: 'จำนวนเงินต้องเป็นอย่างน้อย',
            failedToFetchExchangeRate: 'ไม่สามารถดึงอัตราแลกเปลี่ยนสำหรับ',
            pleaseTryAgain: 'กรุณาลองใหม่อีกครั้ง',
            anErrorOccurred: 'เกิดข้อผิดพลาดขณะประมวลผลการบริจาคของคุณ',
            qrCodeAlt: 'Lightning ใบแจ้งหนี้ QR Code'
        },
        vi: {
            buttonText: 'Quyên góp Bitcoin',
            copyInvoice: 'Sao chép Hóa đơn',
            copied: 'Đã sao chép!',
            paymentSuccessful: 'Thanh toán Thành công. Cảm ơn bạn đã quyên góp.',
            loading: 'Đang tải...',
            invoiceCopied: 'Hóa đơn đã được sao chép vào clipboard',
            failedToCopy: 'Không thể sao chép hóa đơn',
            pleaseEnterValidAmount: 'Vui lòng nhập số tiền hợp lệ',
            amountMustBeAtLeast: 'Số tiền phải ít nhất',
            failedToFetchExchangeRate: 'Không thể lấy tỷ giá hối đoái cho',
            pleaseTryAgain: 'Vui lòng thử lại.',
            anErrorOccurred: 'Đã xảy ra lỗi khi xử lý khoản quyên góp của bạn',
            qrCodeAlt: 'Lightning Hóa đơn QR Code'
        },
        hi: {
            buttonText: 'Bitcoin दान करें',
            copyInvoice: 'इनवॉयस कॉपी करें',
            copied: 'कॉपी हो गया!',
            paymentSuccessful: 'भुगतान सफल। आपके दान के लिए धन्यवाद।',
            loading: 'लोड हो रहा है...',
            invoiceCopied: 'इनवॉयस क्लिपबोर्ड में कॉपी हो गया',
            failedToCopy: 'इनवॉयस कॉपी करने में असफल',
            pleaseEnterValidAmount: 'कृपया एक वैध राशि दर्ज करें',
            amountMustBeAtLeast: 'राशि कम से कम होनी चाहिए',
            failedToFetchExchangeRate: 'विनिमय दर प्राप्त करने में असफल',
            pleaseTryAgain: 'कृपया फिर से कोशिश करें।',
            anErrorOccurred: 'आपके दान को संसाधित करते समय एक त्रुटि हुई',
            qrCodeAlt: 'Lightning इनवॉयस QR कोड'
        },
        bn: {
            buttonText: 'Bitcoin দান করুন',
            copyInvoice: 'ইনভয়েস কপি করুন',
            copied: 'কপি হয়েছে!',
            paymentSuccessful: 'পেমেন্ট সফল। আপনার দানের জন্য ধন্যবাদ।',
            loading: 'লোড হচ্ছে...',
            invoiceCopied: 'ইনভয়েস ক্লিপবোর্ডে কপি হয়েছে',
            failedToCopy: 'ইনভয়েস কপি করতে ব্যর্থ',
            pleaseEnterValidAmount: 'অনুগ্রহ করে একটি বৈধ পরিমাণ লিখুন',
            amountMustBeAtLeast: 'পরিমাণ কমপক্ষে হতে হবে',
            failedToFetchExchangeRate: 'বিনিময় হার আনতে ব্যর্থ',
            pleaseTryAgain: 'অনুগ্রহ করে আবার চেষ্টা করুন।',
            anErrorOccurred: 'আপনার দান প্রক্রিয়াকরণের সময় একটি ত্রুটি ঘটেছে',
            qrCodeAlt: 'Lightning ইনভয়েস QR কোড'
        },
        fa: {
            buttonText: 'بیت‌کوین اهدا کنید',
            copyInvoice: 'کپی فاکتور',
            copied: 'کپی شد!',
            paymentSuccessful: 'پرداخت موفق. از اهدای شما متشکریم.',
            loading: 'در حال بارگذاری...',
            invoiceCopied: 'فاکتور در کلیپ‌بورد کپی شد',
            failedToCopy: 'کپی فاکتور ناموفق',
            pleaseEnterValidAmount: 'لطفاً مبلغ معتبری وارد کنید',
            amountMustBeAtLeast: 'مبلغ باید حداقل باشد',
            failedToFetchExchangeRate: 'دریافت نرخ ارز ناموفق برای',
            pleaseTryAgain: 'لطفاً دوباره تلاش کنید.',
            anErrorOccurred: 'خطایی در پردازش اهدای شما رخ داد',
            qrCodeAlt: 'کد QR فاکتور Lightning'
        },
        ps: {
            buttonText: 'بیټ کوین ورکړه',
            copyInvoice: 'فکتور کاپي کړئ',
            copied: 'کاپي شو!',
            paymentSuccessful: 'تادیه بریالۍ وه. ستاسو د ورکړې لپاره مننه.',
            loading: 'بارېږي...',
            invoiceCopied: 'فکتور په کلپ بورډ کې کاپي شو',
            failedToCopy: 'د فکتور کاپي کول ناکامه شول',
            pleaseEnterValidAmount: 'مهرباني وکړئ سمه اندازه داخل کړئ',
            amountMustBeAtLeast: 'اندازه باید لږ تر لږه وي',
            failedToFetchExchangeRate: 'د تبادلې نرخ ترلاسه کول ناکامه شو',
            pleaseTryAgain: 'مهرباني وکړئ بیا هڅه وکړئ.',
            anErrorOccurred: 'ستاسو د ورکړې پروسس کولو کې ستونزه رامنځته شوه',
            qrCodeAlt: 'Lightning فکتور QR کوډ'
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
                    const blinkLogoLight = 'https://blinkbitcoin.github.io/donation-button.blink.sv/img/blink-light.svg';
        const blinkLogoDark = 'https://blinkbitcoin.github.io/donation-button.blink.sv/img/blink-dark.svg';
        const checkmarkSvg = 'https://blinkbitcoin.github.io/donation-button.blink.sv/img/successcheckmark.svg';
            
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
                
                /* CSS Reset for Blink Pay Widget */
                .blink-pay-widget, .blink-pay-widget * {
                    margin: 0 !important;
                    padding: 0 !important;
                    border: 0 !important;
                    font-size: 100% !important;
                    font: inherit !important;
                    vertical-align: baseline !important;
                    -webkit-box-sizing: border-box !important;
                    -moz-box-sizing: border-box !important;
                    box-sizing: border-box !important;
                }
                .blink-pay-widget {
                    line-height: 1 !important;
                }
                .blink-pay-widget ol, .blink-pay-widget ul {
                    list-style: none !important;
                }
                .blink-pay-widget table {
                    border-collapse: collapse !important;
                    border-spacing: 0 !important;
                }
                .blink-pay-widget input, .blink-pay-widget select {
                    background: none !important;
                    border: none !important;
                    outline: none !important;
                    -webkit-appearance: none !important;
                    -moz-appearance: none !important;
                    appearance: none !important;
                }
                
                .blink-pay-widget {
                    font-family: 'IBM Plex Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
                    width: 370px !important;
                    height: 265px !important;
                    margin: 0 auto !important;
                    padding: 20px !important;
                    border-radius: 12px !important;
                    background-color: ${bgColor} !important;
                    color: ${textColor} !important;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1) !important;
                    border: 1px solid ${borderColor} !important;
                    position: relative !important;
                    display: flex !important;
                    flex-direction: column !important;
                    box-sizing: border-box !important;
                    min-width: 370px !important;
                    max-width: 370px !important;
                    line-height: normal !important;
                    text-align: left !important;
                    overflow: hidden !important;
                }
                .blink-pay-widget * {
                    box-sizing: border-box !important;
                }
                .blink-pay-widget input, 
                .blink-pay-widget select, 
                .blink-pay-widget button {
                    font-family: 'IBM Plex Sans', sans-serif !important;
                }
                
                /* Top third - Header */
                .blink-pay-header {
                    display: flex !important;
                    justify-content: space-between !important;
                    align-items: center !important;
                    height: 32px !important; /* Top third */
                    margin-bottom: 15px !important;
                    width: 100% !important;
                    box-sizing: border-box !important;
                    margin-top: 0 !important;
                    margin-left: 0 !important;
                    margin-right: 0 !important;
                    padding: 0 !important;
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
                    height: 140px !important; /* Middle third */
                    display: flex !important;
                    flex-direction: column !important;
                    justify-content: center !important;
                    align-items: center !important;
                    gap: 15px !important;
                    width: 100% !important;
                    box-sizing: border-box !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }
                .blink-pay-input-group {
                    width: 100% !important;
                    display: flex !important;
                    flex-direction: row !important;
                    border: 1px solid ${borderColor} !important;
                    border-radius: 8px !important;
                    overflow: hidden !important;
                    background-color: ${inputBgColor} !important;
                    box-sizing: border-box !important;
                    margin: 0 !important;
                    position: relative !important;
                    align-items: stretch !important;
                }
                .blink-pay-widget .blink-pay-input-group input,
                .blink-pay-input-group input[type="number"] {
                    flex: 1 1 auto !important;
                    padding: 10px 12px !important;
                    border: none !important;
                    background-color: ${inputBgColor} !important;
                    color: ${textColor} !important;
                    font-size: 16px !important;
                    font-family: 'IBM Plex Sans', sans-serif !important;
                    width: auto !important;
                    min-width: 120px !important;
                    height: auto !important;
                    line-height: normal !important;
                    box-sizing: border-box !important;
                    margin: 0 !important;
                    outline: none !important;
                    border-radius: 0 !important;
                    -webkit-appearance: none !important;
                    -moz-appearance: textfield !important;
                }
                .blink-pay-widget .blink-pay-input-group input:focus,
                .blink-pay-input-group input[type="number"]:focus {
                    outline: none !important;
                    box-shadow: none !important;
                }
                .blink-pay-widget .blink-pay-currency-select,
                .blink-pay-input-group .blink-pay-currency-select {
                    border: none !important;
                    background-color: ${secondaryBgColor} !important;
                    color: ${textColor} !important;
                    font-size: 16px !important;
                    font-weight: 500 !important;
                    padding: 10px 12px !important;
                    cursor: pointer !important;
                    font-family: 'IBM Plex Sans', sans-serif !important;
                    min-width: 70px !important;
                    width: auto !important;
                    flex-shrink: 0 !important;
                    height: auto !important;
                    line-height: normal !important;
                    box-sizing: border-box !important;
                    margin: 0 !important;
                    border-radius: 0 !important;
                    -webkit-appearance: none !important;
                    -moz-appearance: none !important;
                    appearance: none !important;
                }
                .blink-pay-widget .blink-pay-currency-select:focus,
                .blink-pay-input-group .blink-pay-currency-select:focus {
                    outline: none !important;
                    box-shadow: none !important;
                }
                .blink-pay-qr {
                    display: none;
                    width: 100% !important;
                    height: 120px !important;
                    justify-content: center !important;
                    align-items: flex-start !important;
                    padding-top: 5px !important;
                    margin-bottom: 15px !important;
                    box-sizing: border-box !important;
                }
                .blink-pay-qr.blink-pay-show {
                    display: flex !important;
                }
                .blink-pay-qr img {
                    width: 110px !important;
                    height: 110px !important;
                    background-color: white !important;
                    border-radius: 8px !important;
                    padding: 5px !important;
                    box-sizing: border-box !important;
                }
                .blink-pay-success {
                    display: none;
                    width: 100% !important;
                    height: 120px !important;
                    justify-content: center !important;
                    align-items: flex-start !important;
                    padding-top: 5px !important;
                    margin-bottom: 15px !important;
                    box-sizing: border-box !important;
                }
                .blink-pay-success.blink-pay-show {
                    display: flex !important;
                }
                .blink-pay-success img {
                    width: 80px !important;
                    height: 80px !important;
                }
                
                /* Bottom third - Button & Footer */
                .blink-pay-footer {
                    height: 38px; /* Bottom third */
                    display: flex;
                    flex-direction: column;
                    margin-top: auto;
                }
                .blink-pay-widget .${this.buttonClass},
                .${this.buttonClass} {
                    width: 100% !important;
                    padding: 10px 12px !important;
                    background: ${colors.gradient} !important;
                    color: white !important;
                    border: none !important;
                    border-radius: 8px !important;
                    cursor: pointer !important;
                    font-size: 14px !important;
                    font-weight: 600 !important;
                    text-align: center !important;
                    transition: all 0.2s !important;
                    font-family: 'IBM Plex Sans', sans-serif !important;
                    margin-bottom: 10px !important;
                    white-space: nowrap !important;
                    overflow: hidden !important;
                    text-overflow: ellipsis !important;
                    height: 44px !important;
                    max-height: 44px !important;
                    min-height: 44px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    box-sizing: border-box !important;
                    margin-top: 0 !important;
                    margin-left: 0 !important;
                    margin-right: 0 !important;
                    -webkit-appearance: none !important;
                    -moz-appearance: none !important;
                    appearance: none !important;
                }
                .blink-pay-widget .${this.buttonClass}.success,
                .${this.buttonClass}.success {
                    background: #00a700 !important;
                }
                .blink-pay-widget .${this.buttonClass}:hover,
                .${this.buttonClass}:hover {
                    opacity: 0.9 !important;
                    transform: translateY(-1px) !important;
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
            
            // Build analytics tracking URL for Blink logo
            const analyticsUrl = this.buildBlinkAnalyticsUrl();
            
            const html = `
                <div class="blink-pay-widget">
                    <!-- Top third -->
                    <div class="blink-pay-header">
                        <a href="${analyticsUrl}" target="_blank" rel="noopener noreferrer">
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
            
            // Apply font sizing to the initial button text
            setTimeout(() => {
                const initialButton = document.getElementById('blink-pay-button');
                if (initialButton) {
                    this.adjustButtonFontSize(initialButton, this.buttonText);
                }
            }, 10);
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
                            usdCentPrice {
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
                const usdCentPrice = data.data.realtimePrice.usdCentPrice;
                
                // Calculate rates based on API response
                // btcSatPrice: price of 1 sat in the queried currency  
                // usdCentPrice: price of 1 USD cent in the queried currency
                const satPriceInCurrency = btcSatPrice.base / Math.pow(10, btcSatPrice.offset);
                const usdCentPriceInCurrency = usdCentPrice.base / Math.pow(10, usdCentPrice.offset);
                
                // Cache both rates
                this.exchangeRates[currencyCode] = {
                    satPriceInCurrency: satPriceInCurrency,
                    usdCentPriceInCurrency: usdCentPriceInCurrency
                };
                
                this.log(`Exchange rates for ${currencyCode}:`, {
                    satPriceInCurrency: satPriceInCurrency,
                    usdCentPriceInCurrency: usdCentPriceInCurrency
                });
                
                return this.exchangeRates[currencyCode];
                
            } catch (error) {
                this.log(`Error fetching exchange rate for ${currencyCode}: ${error.message}`, error);
                console.error('Error fetching exchange rate:', error);
                this.showStatus('error', `${this.t('failedToFetchExchangeRate')} ${currencyCode}. ${this.t('pleaseTryAgain')}`);
                throw error;
            }
        },
        
        // Convert amount to satoshis
        convertToSatoshis: function(amount, fromCurrency) {
            if (fromCurrency === 'sats') {
                return amount; // Already in sats
            }
            
            // For fiat currencies, use cached exchange rate
            const exchangeRates = this.exchangeRates[fromCurrency];
            if (!exchangeRates || !exchangeRates.satPriceInCurrency) {
                throw new Error(`Exchange rate not available for ${fromCurrency.toUpperCase()}`);
            }
            
            // The API returns price of 1 sat in minor units of the currency
            // Convert major currency units to minor units, then to sats
            const amountInMinorUnits = amount * 100; // Convert to cents/minor units
            const satsAmount = Math.round(amountInMinorUnits / exchangeRates.satPriceInCurrency);
            this.log(`Converting ${amount} ${fromCurrency.toUpperCase()} to ${satsAmount} sats (1 sat = ${exchangeRates.satPriceInCurrency} ${fromCurrency.toUpperCase()} minor units)`);
            return satsAmount;
        },
        
        // Convert amount to USD cents
        convertToUsdCents: function(amount, fromCurrency) {
            if (fromCurrency === 'sats') {
                // For sats to USD cents, we need USD exchange rate
                const usdRates = this.exchangeRates['USD'];
                if (!usdRates || !usdRates.satPriceInCurrency) {
                    throw new Error('USD exchange rate not available');
                }
                
                // satPriceInCurrency is in USD minor units (cents) per sat
                // So sats * satPriceInCurrency gives us USD cents directly
                const usdCentsAmount = Math.round(amount * usdRates.satPriceInCurrency);
                this.log(`Converting ${amount} sats to ${usdCentsAmount} USD cents (1 sat = ${usdRates.satPriceInCurrency} USD cents)`);
                return usdCentsAmount;
            }
            
            // For fiat currencies, use cached exchange rate
            const exchangeRates = this.exchangeRates[fromCurrency];
            if (!exchangeRates || !exchangeRates.usdCentPriceInCurrency) {
                throw new Error(`Exchange rate not available for ${fromCurrency.toUpperCase()}`);
            }
            
            // Convert major currency units to minor units, then to USD cents
            const amountInMinorUnits = amount * 100; // Convert to cents/minor units
            const usdCentsAmount = Math.round(amountInMinorUnits / exchangeRates.usdCentPriceInCurrency);
            this.log(`Converting ${amount} ${fromCurrency.toUpperCase()} to ${usdCentsAmount} USD cents (1 USD cent = ${exchangeRates.usdCentPriceInCurrency} ${fromCurrency.toUpperCase()} minor units)`);
            return usdCentsAmount;
        },
        
        // Handle the donation process
        handleDonate: async function() {
            try {
                this.log('Donate button clicked');
                
                const amountInput = document.getElementById('blink-pay-amount');
                const amount = parseFloat(amountInput.value);
                
                if (isNaN(amount) || amount <= 0) {
                    this.showStatus('error', this.t('pleaseEnterValidAmount'));
                    return;
                }
                
                // Validate amount
                if (this.selectedCurrency === 'sats') {
                    if (amount < this.minAmount) {
                        this.showStatus('error', `${this.t('amountMustBeAtLeast')} ${this.minAmount} sats`);
                        return;
                    }
                } else {
                    if (amount < 0.01) {
                        this.showStatus('error', `${this.t('amountMustBeAtLeast')} 0.01 ${this.selectedCurrency.toUpperCase()}`);
                        return;
                    }
                    
                    // Ensure we have exchange rates for the selected currency
                    let exchangeRates = this.exchangeRates[this.selectedCurrency];
                    if (!exchangeRates) {
                        try {
                            await this.fetchExchangeRate(this.selectedCurrency);
                            exchangeRates = this.exchangeRates[this.selectedCurrency];
                        } catch (error) {
                            return; // Error already shown in fetchExchangeRate
                        }
                    }
                }
                
                // Clear any previous status messages and start loading
                this.showStatus('', '');
                this.setButtonLoading(true);
                
                try {
                    this.log(`Processing donation: ${amount} ${this.selectedCurrency}`);
                    
                    // Step 1: Get wallet information
                    this.log('About to call getAccountDefaultWallet');
                    if (typeof this.getAccountDefaultWallet !== 'function') {
                        throw new Error('getAccountDefaultWallet is not a function - this context may be lost');
                    }
                    const walletInfo = await this.getAccountDefaultWallet(this.username);
                    if (!walletInfo || !walletInfo.id) {
                        throw new Error('Could not retrieve wallet information for this username');
                    }
                    this.log(`Retrieved wallet info:`, walletInfo);
                    
                    // Step 2: Convert amount to the correct unit based on wallet currency
                    let convertedAmount;
                    if (walletInfo.currency === 'BTC') {
                        // Convert to satoshis for BTC wallets
                        convertedAmount = this.convertToSatoshis(amount, this.selectedCurrency);
                        this.log(`Converted to ${convertedAmount} satoshis for BTC wallet`);
                    } else if (walletInfo.currency === 'USD') {
                        // Convert to USD cents for USD wallets
                        // First ensure we have USD rates if converting from sats
                        if (this.selectedCurrency === 'sats' && !this.exchangeRates['USD']) {
                            await this.fetchExchangeRate('USD');
                        }
                        convertedAmount = this.convertToUsdCents(amount, this.selectedCurrency);
                        this.log(`Converted to ${convertedAmount} USD cents for USD wallet`);
                    } else {
                        throw new Error(`Unsupported wallet currency: ${walletInfo.currency}`);
                    }
                    
                    // Step 3: Create invoice using appropriate currency
                    this.log('About to call createInvoice');
                    if (typeof this.createInvoice !== 'function') {
                        throw new Error('createInvoice is not a function - this context may be lost');
                    }
                    const paymentRequest = await this.createInvoice(walletInfo.id, convertedAmount, walletInfo.currency);
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
            } catch (topLevelError) {
                console.error('Top-level error in handleDonate:', topLevelError);
                console.error('Error stack:', topLevelError.stack);
                console.error('Widget context:', this);
                this.showStatus('error', `Debug error: ${topLevelError.message}`);
                this.setButtonLoading(false);
            }
        },
        
        // Get the default wallet information for a username
        getAccountDefaultWallet: async function(username) {
            const query = `
                query Query($username: Username!) {
                    accountDefaultWallet(username: $username) {
                        id
                        currency
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
                    throw new Error(data.errors[0].message || 'Error fetching wallet information');
                }
                
                return {
                    id: data.data.accountDefaultWallet?.id,
                    currency: data.data.accountDefaultWallet?.currency
                };
                
            } catch (error) {
                this.log(`API error for accountDefaultWallet: ${error.message}`, error);
                console.error('Error getting wallet information:', error);
                throw error;
            }
        },
        
        // Create a lightning invoice
        createInvoice: async function(walletId, amount, currency) {
            let mutation, mutationName, variables;
            
            if (currency === 'BTC') {
                // Use BTC mutation
                mutation = `
                    mutation Mutation($input: LnInvoiceCreateOnBehalfOfRecipientInput!) {
                        lnInvoiceCreateOnBehalfOfRecipient(input: $input) {
                            invoice {
                                paymentRequest
                                satoshis
                            }
                        }
                    }
                `;
                
                variables = {
                    input: {
                        recipientWalletId: walletId,
                        amount: amount.toString(),
                        memo: `${this.username} donation button`
                    }
                };
                
                mutationName = 'lnInvoiceCreateOnBehalfOfRecipient';
            } else if (currency === 'USD') {
                // Use USD mutation
                mutation = `
                    mutation LnUsdInvoiceCreateOnBehalfOfRecipient($input: LnUsdInvoiceCreateOnBehalfOfRecipientInput!) {
                        lnUsdInvoiceCreateOnBehalfOfRecipient(input: $input) {
                            invoice {
                                paymentRequest
                                satoshis
                            }
                        }
                    }
                `;
                
                variables = {
                    input: {
                        amount: amount.toString(),
                        recipientWalletId: walletId,
                        memo: `${this.username} donation button`
                    }
                };
                
                mutationName = 'lnUsdInvoiceCreateOnBehalfOfRecipient';
            } else {
                throw new Error(`Unsupported currency: ${currency}`);
            }
            
            try {
                this.log(`Fetching from API: ${mutationName}`, { variables });
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
                this.log(`API response for ${mutationName}`, data);
                
                if (data.errors) {
                    throw new Error(data.errors[0].message || 'Error creating invoice');
                }
                
                return data.data[mutationName].invoice.paymentRequest;
                
            } catch (error) {
                this.log(`API error for ${mutationName}: ${error.message}`, error);
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
            successContainer.classList.remove('blink-pay-show');
            successContainer.style.visibility = 'hidden';
            
            // Hide input field more robustly
            const inputGroup = amountInput.parentElement;
            inputGroup.style.display = 'none';
            inputGroup.style.visibility = 'hidden';
            inputGroup.style.opacity = '0';
            inputGroup.style.height = '0';
            inputGroup.style.overflow = 'hidden';
            
            // Generate clean, maximally scannable QR code - keep larger size for better scanning
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentRequest)}`;
            this.log(`Generating clean QR code: ${qrUrl}`);
            
            const qrImage = document.createElement('img');
            qrImage.src = qrUrl;
            qrImage.alt = this.t('qrCodeAlt');
            qrContainer.innerHTML = '';
            qrContainer.appendChild(qrImage);
            qrContainer.classList.add('blink-pay-show');
            qrContainer.style.visibility = 'visible';
            qrContainer.style.opacity = '1';
            
            // Update the button for copy to clipboard functionality
            const donateButton = document.getElementById('blink-pay-button');
            this.updateButtonText(donateButton, this.t('copyInvoice'));
            
            // Remove all existing event listeners by cloning and replacing the button
            const newButton = donateButton.cloneNode(true);
            donateButton.parentNode.replaceChild(newButton, donateButton);
            
            // Add new event listener for copying the invoice
            newButton.addEventListener('click', () => {
                navigator.clipboard.writeText(paymentRequest).then(() => {
                    this.showStatus('success', this.t('invoiceCopied'));
                    
                    // Change button text temporarily to show success
                    this.updateButtonText(newButton, this.t('copied'));
                    setTimeout(() => {
                        this.updateButtonText(newButton, this.t('copyInvoice'));
                    }, 1500);
                    
                }).catch(err => {
                    console.error('Could not copy invoice: ', err);
                    this.showStatus('error', this.t('failedToCopy'));
                });
            });
            
            this.setButtonLoading(false);
        },
        
        // Generate QR code with logo overlay using canvas
        generateQRWithLogo: function(paymentRequest, container) {
            this.log(`Generating QR code with logo overlay for payment request`);
            
            // Clear container
            container.innerHTML = '';
            
            // Generate QR code using qrserver.com with high error correction for logo overlay
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentRequest)}&ecc=H`;
            this.log(`Generating base QR code: ${qrUrl}`);
            
            // Create an img element as fallback (in case canvas fails)
            const fallbackImg = document.createElement('img');
            fallbackImg.src = qrUrl;
            fallbackImg.alt = this.t('qrCodeAlt');
            fallbackImg.style.width = '110px';
            fallbackImg.style.height = '110px';
            fallbackImg.style.backgroundColor = 'white';
            fallbackImg.style.borderRadius = '8px';
            fallbackImg.style.padding = '5px';
            
            // Create canvas for compositing
            const canvas = document.createElement('canvas');
            canvas.width = 110;
            canvas.height = 110;
            canvas.style.width = '110px';
            canvas.style.height = '110px';
            canvas.style.backgroundColor = 'white';
            canvas.style.borderRadius = '8px';
            canvas.style.padding = '8px';
            const ctx = canvas.getContext('2d');
            
            // Load QR code image
            const qrImage = new Image();
            qrImage.crossOrigin = 'anonymous';
            
            qrImage.onload = () => {
                this.log(`QR code image loaded successfully`);
                
                // Draw QR code on canvas
                ctx.drawImage(qrImage, 0, 0, 110, 110);
                
                // Load and draw the Blink logo
                const logoImage = new Image();
                logoImage.crossOrigin = 'anonymous';
                
                logoImage.onload = () => {
                    this.log(`Logo image loaded successfully`);
                    
                    // Calculate logo size (10% of QR code for good balance)
                    const logoSize = Math.round(110 * 0.10);
                    const logoX = (110 - logoSize) / 2;
                    const logoY = (110 - logoSize) / 2;
                    
                    // Draw logo centered on QR code
                    ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
                    
                    this.log(`Successfully generated QR code with Blink logo overlay (${logoSize}px)`);
                    
                    // Replace fallback image with canvas
                    container.removeChild(fallbackImg);
                    container.appendChild(canvas);
                };
                
                logoImage.onerror = (error) => {
                    this.log(`Failed to load logo image:`, error);
                    this.log(`Logo URL attempted: https://blinkbitcoin.github.io/donation-button.blink.sv/img/blink_qr.svg`);
                    // Keep the fallback QR without logo
                };
                
                // Use absolute URL for the blink_qr.svg logo
                logoImage.src = 'https://blinkbitcoin.github.io/donation-button.blink.sv/img/blink_qr.svg';
            };
            
            qrImage.onerror = (error) => {
                this.log(`Failed to load QR code image:`, error);
                // Fallback: show basic error message
                container.innerHTML = '<p style="color: red; text-align: center;">Failed to generate QR code</p>';
            };
            
            // Start by showing fallback image immediately
            container.appendChild(fallbackImg);
            
            // Start loading QR image
            qrImage.src = qrUrl;
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
            
            // Hide QR code completely
            qrContainer.classList.remove('blink-pay-show');
            qrContainer.style.visibility = 'hidden';
            qrContainer.style.opacity = '0';
            
            // Hide amount input completely
            const inputGroup = amountInput.parentElement;
            inputGroup.style.display = 'none';
            inputGroup.style.visibility = 'hidden';
            inputGroup.style.opacity = '0';
            inputGroup.style.height = '0';
            inputGroup.style.overflow = 'hidden';
            
            // Show success icon
            successContainer.classList.add('blink-pay-show');
            successContainer.style.visibility = 'visible';
            successContainer.style.opacity = '1';
            
            // Reset the donation form
            const donateButton = document.getElementById('blink-pay-button');
            
            // Update button text and style
            this.updateButtonText(donateButton, this.t('paymentSuccessful'));
            donateButton.classList.add('success');
            
            // Clear status as the message is now in the button
            this.showStatus('', '');
            
            // Remove all event listeners
            const newButton = donateButton.cloneNode(true);
            donateButton.parentNode.replaceChild(newButton, donateButton);
            
            // Add new event listener to reset the widget
            newButton.addEventListener('click', () => {
                // Reset the widget back to initial state
                successContainer.classList.remove('blink-pay-show');
                successContainer.style.visibility = 'hidden';
                successContainer.style.opacity = '0';
                this.updateButtonText(newButton, this.t('buttonText'));
                newButton.classList.remove('success');
                
                // Show input field again
                const inputGroup = amountInput.parentElement;
                inputGroup.style.display = 'flex';
                inputGroup.style.visibility = 'visible';
                inputGroup.style.opacity = '1';
                inputGroup.style.height = 'auto';
                inputGroup.style.overflow = 'visible';
                
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
        },
        
        // Dynamically adjust button font size based on text length
        adjustButtonFontSize: function(button, text) {
            if (!button || !text) return;
            
            // Create a temporary span to measure text width
            const tempSpan = document.createElement('span');
            tempSpan.style.visibility = 'hidden';
            tempSpan.style.position = 'absolute';
            tempSpan.style.whiteSpace = 'nowrap';
            tempSpan.style.fontFamily = button.style.fontFamily || 'IBM Plex Sans';
            tempSpan.style.fontWeight = button.style.fontWeight || '600';
            tempSpan.textContent = text;
            document.body.appendChild(tempSpan);
            
            // Get button's available width (subtract padding)
            const buttonWidth = button.clientWidth - 24; // 12px padding on each side
            
            // Start with maximum font size and reduce until it fits (2pts smaller than before)
            let fontSize = 14;
            tempSpan.style.fontSize = fontSize + 'px';
            
            // Reduce font size until text fits
            while (tempSpan.offsetWidth > buttonWidth && fontSize > 6) {
                fontSize -= 0.5;
                tempSpan.style.fontSize = fontSize + 'px';
            }
            
            // Apply the calculated font size
            button.style.fontSize = fontSize + 'px';
            
            // Clean up
            document.body.removeChild(tempSpan);
            
            this.log(`Adjusted font size to ${fontSize}px for text: "${text}"`);
        },
        
        // Update button text with dynamic font sizing
        updateButtonText: function(button, text) {
            if (!button || !text) return;
            
            button.textContent = text;
            
            // Use a small delay to ensure the button has rendered
            setTimeout(() => {
                this.adjustButtonFontSize(button, text);
            }, 10);
        },
        
        // Build analytics tracking URL for Blink logo
        buildBlinkAnalyticsUrl: function() {
            const baseUrl = 'https://get.blink.sv';
            const params = new URLSearchParams();
            
            // Add username parameter
            if (this.username) {
                params.append('username', this.username);
            }
            
            // Add referral source
            params.append('referral', 'embedded_donation_button');
            
            // Add the current page URL where the widget is embedded
            try {
                const currentUrl = window.location.href;
                params.append('embed_url', currentUrl);
            } catch (e) {
                // Fallback if window.location is not available
                this.log('Could not get current URL for analytics', e);
            }
            
            // Add widget version for tracking
            params.append('widget_version', '1.2.3');
            
            return `${baseUrl}?${params.toString()}`;
        }
    };
    
    // Expose to global scope
    window.BlinkPayButton = BlinkPayButton;
})(); 
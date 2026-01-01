export type Language = 'hr' | 'en' | 'de' | 'pl' | 'es' | 'fr';

export const translations: Record<Language, Record<string, string>> = {
  hr: {
    // Navigation
    'nav.home': 'Početna',
    'nav.monthly': 'Mjesečno',
    'nav.archive': 'Arhiva',
    'nav.options': 'Opcije',

    // Month names
    'month.0': 'Siječanj',
    'month.1': 'Veljača',
    'month.2': 'Ožujak',
    'month.3': 'Travanj',
    'month.4': 'Svibanj',
    'month.5': 'Lipanj',
    'month.6': 'Srpanj',
    'month.7': 'Kolovoz',
    'month.8': 'Rujan',
    'month.9': 'Listopad',
    'month.10': 'Studeni',
    'month.11': 'Prosinac',

    // Balance card
    'balance.current': 'Trenutno stanje',
    'balance.income': 'Prihodi',
    'balance.expense': 'Rashodi',
    'balance.investment': 'Investicije',
    'balance.savings': 'Štednja',

    // Transactions
    'transaction.add.income': 'Dodaj prihod',
    'transaction.add.expense': 'Dodaj rashod',
    'transaction.add.investment': 'Dodaj investiciju',
    'transaction.add.savings': 'Dodaj štednju',
    'transaction.button.income': 'prihod',
    'transaction.button.expense': 'rashod',
    'transaction.button.investment': 'investiciju',
    'transaction.button.savings': 'štednju',
    'transaction.amount': 'Iznos (€)',
    'transaction.category': 'Kategorija',
    'transaction.selectCategory': 'Odaberi kategoriju',
    'transaction.categoryName': 'Naziv kategorije',
    'transaction.categoryDesc': 'Opis kategorije (opcionalno)',
    'transaction.noTransactions': 'Nema transakcija',
    'transaction.lastTransactions': 'Posljednje transakcije',
    'transaction.allTransactions': 'Sve transakcije',

    // Quick expense
    'quickExpense.title': 'Brzi unos troška',
    'quickExpense.add': 'Dodaj trošak',

    // Toasts
    'toast.income.added': 'Prihod dodan',
    'toast.expense.added': 'Trošak dodan',
    'toast.investment.added': 'Investicija dodana',
    'toast.savings.added': 'Štednja dodana',
    'toast.transaction.removed': 'Transakcija uklonjena',
    'toast.category.added': 'Kategorija dodana',
    'toast.category.removed': 'Kategorija uklonjena',
    'toast.balance.transferred': 'Stanje preneseno',
    'toast.balance.transferFailed': 'Nije moguće prenijeti',
    'toast.balance.alreadyTransferred': 'Stanje je već preneseno ili nema stanja za prijenos',

    // Monthly page
    'monthly.income': 'Prihodi',
    'monthly.expense': 'Rashodi',
    'monthly.investment': 'Investicije',
    'monthly.savings': 'Štednja',
    'monthly.categories': 'Kategorije',
    'monthly.incomeThisMonth': 'Prihodi ovog mjeseca',
    'monthly.expenseThisMonth': 'Rashodi ovog mjeseca',
    'monthly.investmentThisMonth': 'Investicije ovog mjeseca',
    'monthly.savingsThisMonth': 'Štednja ovog mjeseca',
    'monthly.carryOver': 'Prenesi stanje iz prethodnog mjeseca',
    'monthly.fromPreviousPeriod': 'Iz prethodnog razdoblja',
    'monthly.addFromPrevious': 'Dodaj',

    // Categories
    'category.income': 'Kategorije prihoda',
    'category.expense': 'Kategorije rashoda',
    'category.investment': 'Kategorije investicija',
    'category.savings': 'Kategorije štednje',

    // Archive
    'archive.title': 'Arhiva',
    'archive.subtitle': 'Pregledaj prošle mjesece',
    'archive.noArchived': 'Nema arhiviranih mjeseci',
    'archive.willAppear': 'Prošli mjeseci će se automatski pojaviti ovdje',
    'archive.backToArchive': 'Natrag na arhivu',

    // Dialog
    'dialog.confirm': 'Jeste li sigurni?',
    'dialog.deleteTransaction': 'Ova radnja će trajno obrisati transakciju',
    'dialog.cancel': 'Odustani',
    'dialog.delete': 'Obriši',

    // Options
    'options.title': 'Opcije',
    'options.language': 'Jezik',
    'options.theme': 'Tema',
    'options.theme.light': 'Svijetla',
    'options.theme.dark': 'Tamna',

    // PDF Export
    'pdf.export': 'Preuzmi PDF',
    'pdf.summary': 'Sažetak',
    'pdf.transactions': 'Transakcije',
    'pdf.name': 'Naziv',
    'pdf.type': 'Tip',
    'pdf.date': 'Datum',

    // Budget Limits
    'limits.title': 'Mjesečni limiti',
    'limits.description': 'Postavi limite za praćenje potrošnje i ciljeve štednje.',
    'limits.expense': 'Limit rashoda',
    'limits.investment': 'Limit investicija',
    'limits.savings': 'Cilj štednje',
    'limits.set': 'Postavi limite',
    'limits.save': 'Spremi',
    'limits.noLimit': 'Bez limita',
    'limits.spent': 'Potrošeno',
    'limits.of': 'od',
    'limits.warning': 'Približavate se limitu!',
    'limits.exceeded': 'Limit prekoračen!',
    'limits.remaining': 'Preostalo',

    // Recurring Transactions
    'recurring.title': 'Ponavljajuće transakcije',
    'recurring.description': 'Transakcije koje se automatski dodaju svakog mjeseca (npr. plaća, režije, pretplate).',
    'recurring.add': 'Dodaj ponavljajuću',
    'recurring.name': 'Naziv transakcije',
    'recurring.list': 'Aktivne ponavljajuće transakcije',
    'recurring.empty': 'Nema ponavljajućih transakcija',
    'recurring.apply': 'Primijeni ponavljajuće',
    'recurring.applied': 'Ponavljajuće transakcije primijenjene',
    'recurring.alreadyApplied': 'Već primijenjeno ovaj mjesec',

    // Notifications
    'notifications.title': 'Obavijesti',
    'notifications.description': 'Postavi podsjetnike za unos troškova i upozorenja o budžetu.',
    'notifications.enable': 'Omogući obavijesti',
    'notifications.dailyReminder': 'Dnevni podsjetnik',
    'notifications.reminderTime': 'Vrijeme podsjetnika',
    'notifications.budgetWarnings': 'Upozorenja o budžetu',
    'notifications.permissionRequired': 'Potrebna je dozvola za obavijesti.',

    // Install
    'install.title': 'Instaliraj aplikaciju',
    'install.settingsDescription': 'Instaliraj aplikaciju na svoj uređaj za brži pristup.',
    'install.openInstructions': 'Upute za instalaciju',
  },

  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.monthly': 'Monthly',
    'nav.archive': 'Archive',
    'nav.options': 'Options',

    // Month names
    'month.0': 'January',
    'month.1': 'February',
    'month.2': 'March',
    'month.3': 'April',
    'month.4': 'May',
    'month.5': 'June',
    'month.6': 'July',
    'month.7': 'August',
    'month.8': 'September',
    'month.9': 'October',
    'month.10': 'November',
    'month.11': 'December',

    // Balance card
    'balance.current': 'Current Balance',
    'balance.income': 'Income',
    'balance.expense': 'Expenses',
    'balance.investment': 'Investments',
    'balance.savings': 'Savings',

    // Transactions
    'transaction.add.income': 'Add Income',
    'transaction.add.expense': 'Add Expense',
    'transaction.add.investment': 'Add Investment',
    'transaction.add.savings': 'Add Savings',
    'transaction.button.income': 'income',
    'transaction.button.expense': 'expense',
    'transaction.button.investment': 'investment',
    'transaction.button.savings': 'savings',
    'transaction.amount': 'Amount (€)',
    'transaction.category': 'Category',
    'transaction.selectCategory': 'Select category',
    'transaction.categoryName': 'Category name',
    'transaction.categoryDesc': 'Category description (optional)',
    'transaction.noTransactions': 'No transactions',
    'transaction.lastTransactions': 'Recent transactions',
    'transaction.allTransactions': 'All transactions',

    // Quick expense
    'quickExpense.title': 'Quick Expense',
    'quickExpense.add': 'Add expense',

    // Toasts
    'toast.income.added': 'Income added',
    'toast.expense.added': 'Expense added',
    'toast.investment.added': 'Investment added',
    'toast.savings.added': 'Savings added',
    'toast.transaction.removed': 'Transaction removed',
    'toast.category.added': 'Category added',
    'toast.category.removed': 'Category removed',
    'toast.balance.transferred': 'Balance transferred',
    'toast.balance.transferFailed': 'Cannot transfer',
    'toast.balance.alreadyTransferred': 'Balance already transferred or no balance to transfer',

    // Monthly page
    'monthly.income': 'Income',
    'monthly.expense': 'Expenses',
    'monthly.investment': 'Investments',
    'monthly.savings': 'Savings',
    'monthly.categories': 'Categories',
    'monthly.incomeThisMonth': 'Income this month',
    'monthly.expenseThisMonth': 'Expenses this month',
    'monthly.investmentThisMonth': 'Investments this month',
    'monthly.savingsThisMonth': 'Savings this month',
    'monthly.carryOver': 'Carry over balance from previous month',
    'monthly.fromPreviousPeriod': 'From previous period',
    'monthly.addFromPrevious': 'Add',

    // Categories
    'category.income': 'Income categories',
    'category.expense': 'Expense categories',
    'category.investment': 'Investment categories',
    'category.savings': 'Savings categories',

    // Archive
    'archive.title': 'Archive',
    'archive.subtitle': 'Browse past months',
    'archive.noArchived': 'No archived months',
    'archive.willAppear': 'Past months will automatically appear here',
    'archive.backToArchive': 'Back to archive',

    // Dialog
    'dialog.confirm': 'Are you sure?',
    'dialog.deleteTransaction': 'This action will permanently delete the transaction',
    'dialog.cancel': 'Cancel',
    'dialog.delete': 'Delete',

    // Options
    'options.title': 'Options',
    'options.language': 'Language',
    'options.theme': 'Theme',
    'options.theme.light': 'Light',
    'options.theme.dark': 'Dark',

    // PDF Export
    'pdf.export': 'Download PDF',
    'pdf.summary': 'Summary',
    'pdf.transactions': 'Transactions',
    'pdf.name': 'Name',
    'pdf.type': 'Type',
    'pdf.date': 'Date',

    // Budget Limits
    'limits.title': 'Monthly Limits',
    'limits.description': 'Set limits to track spending and savings goals.',
    'limits.expense': 'Expense Limit',
    'limits.investment': 'Investment Limit',
    'limits.savings': 'Savings Goal',
    'limits.set': 'Set Limits',
    'limits.save': 'Save',
    'limits.noLimit': 'No limit',
    'limits.spent': 'Spent',
    'limits.of': 'of',
    'limits.warning': 'Approaching limit!',
    'limits.exceeded': 'Limit exceeded!',
    'limits.remaining': 'Remaining',

    // Recurring Transactions
    'recurring.title': 'Recurring Transactions',
    'recurring.description': 'Transactions that are automatically added every month (e.g., salary, bills, subscriptions).',
    'recurring.add': 'Add recurring',
    'recurring.name': 'Transaction name',
    'recurring.list': 'Active recurring transactions',
    'recurring.empty': 'No recurring transactions',
    'recurring.apply': 'Apply recurring',
    'recurring.applied': 'Recurring transactions applied',
    'recurring.alreadyApplied': 'Already applied this month',

    // Notifications
    'notifications.title': 'Notifications',
    'notifications.description': 'Set reminders for expense tracking and budget warnings.',
    'notifications.enable': 'Enable notifications',
    'notifications.dailyReminder': 'Daily reminder',
    'notifications.reminderTime': 'Reminder time',
    'notifications.budgetWarnings': 'Budget warnings',
    'notifications.permissionRequired': 'Notification permission required.',

    // Install
    'install.title': 'Install App',
    'install.settingsDescription': 'Install the app on your device for quick access.',
    'install.openInstructions': 'Installation instructions',
  },

  de: {
    // Navigation
    'nav.home': 'Startseite',
    'nav.monthly': 'Monatlich',
    'nav.archive': 'Archiv',
    'nav.options': 'Optionen',

    // Month names
    'month.0': 'Januar',
    'month.1': 'Februar',
    'month.2': 'März',
    'month.3': 'April',
    'month.4': 'Mai',
    'month.5': 'Juni',
    'month.6': 'Juli',
    'month.7': 'August',
    'month.8': 'September',
    'month.9': 'Oktober',
    'month.10': 'November',
    'month.11': 'Dezember',

    // Balance card
    'balance.current': 'Aktueller Kontostand',
    'balance.income': 'Einnahmen',
    'balance.expense': 'Ausgaben',
    'balance.investment': 'Investitionen',
    'balance.savings': 'Ersparnisse',

    // Transactions
    'transaction.add.income': 'Einnahme hinzufügen',
    'transaction.add.expense': 'Ausgabe hinzufügen',
    'transaction.add.investment': 'Investition hinzufügen',
    'transaction.add.savings': 'Ersparnis hinzufügen',
    'transaction.button.income': 'Einnahme',
    'transaction.button.expense': 'Ausgabe',
    'transaction.button.investment': 'Investition',
    'transaction.button.savings': 'Ersparnis',
    'transaction.amount': 'Betrag (€)',
    'transaction.category': 'Kategorie',
    'transaction.selectCategory': 'Kategorie auswählen',
    'transaction.categoryName': 'Kategoriename',
    'transaction.categoryDesc': 'Kategoriebeschreibung (optional)',
    'transaction.noTransactions': 'Keine Transaktionen',
    'transaction.lastTransactions': 'Letzte Transaktionen',
    'transaction.allTransactions': 'Alle Transaktionen',

    // Quick expense
    'quickExpense.title': 'Schnelle Ausgabe',
    'quickExpense.add': 'Ausgabe hinzufügen',

    // Toasts
    'toast.income.added': 'Einnahme hinzugefügt',
    'toast.expense.added': 'Ausgabe hinzugefügt',
    'toast.investment.added': 'Investition hinzugefügt',
    'toast.savings.added': 'Ersparnis hinzugefügt',
    'toast.transaction.removed': 'Transaktion entfernt',
    'toast.category.added': 'Kategorie hinzugefügt',
    'toast.category.removed': 'Kategorie entfernt',
    'toast.balance.transferred': 'Saldo übertragen',
    'toast.balance.transferFailed': 'Übertragung nicht möglich',
    'toast.balance.alreadyTransferred': 'Saldo bereits übertragen oder kein Saldo vorhanden',

    // Monthly page
    'monthly.income': 'Einnahmen',
    'monthly.expense': 'Ausgaben',
    'monthly.investment': 'Investitionen',
    'monthly.savings': 'Ersparnisse',
    'monthly.categories': 'Kategorien',
    'monthly.incomeThisMonth': 'Einnahmen diesen Monat',
    'monthly.expenseThisMonth': 'Ausgaben diesen Monat',
    'monthly.investmentThisMonth': 'Investitionen diesen Monat',
    'monthly.savingsThisMonth': 'Ersparnisse diesen Monat',
    'monthly.carryOver': 'Saldo aus dem Vormonat übertragen',
    'monthly.fromPreviousPeriod': 'Aus vorheriger Periode',
    'monthly.addFromPrevious': 'Hinzufügen',

    // Categories
    'category.income': 'Einnahmekategorien',
    'category.expense': 'Ausgabekategorien',
    'category.investment': 'Investitionskategorien',
    'category.savings': 'Sparenkategorien',

    // Archive
    'archive.title': 'Archiv',
    'archive.subtitle': 'Vergangene Monate durchsuchen',
    'archive.noArchived': 'Keine archivierten Monate',
    'archive.willAppear': 'Vergangene Monate erscheinen automatisch hier',
    'archive.backToArchive': 'Zurück zum Archiv',

    // Dialog
    'dialog.confirm': 'Sind Sie sicher?',
    'dialog.deleteTransaction': 'Diese Aktion löscht die Transaktion dauerhaft',
    'dialog.cancel': 'Abbrechen',
    'dialog.delete': 'Löschen',

    // Options
    'options.title': 'Optionen',
    'options.language': 'Sprache',
    'options.theme': 'Thema',
    'options.theme.light': 'Hell',
    'options.theme.dark': 'Dunkel',

    // PDF Export
    'pdf.export': 'PDF herunterladen',
    'pdf.summary': 'Zusammenfassung',
    'pdf.transactions': 'Transaktionen',
    'pdf.name': 'Name',
    'pdf.type': 'Typ',
    'pdf.date': 'Datum',

    // Budget Limits
    'limits.title': 'Monatliche Limits',
    'limits.description': 'Legen Sie Limits fest, um Ausgaben und Sparziele zu verfolgen.',
    'limits.expense': 'Ausgabenlimit',
    'limits.investment': 'Investitionslimit',
    'limits.savings': 'Sparziel',
    'limits.set': 'Limits festlegen',
    'limits.save': 'Speichern',
    'limits.noLimit': 'Kein Limit',
    'limits.spent': 'Ausgegeben',
    'limits.of': 'von',
    'limits.warning': 'Limit fast erreicht!',
    'limits.exceeded': 'Limit überschritten!',
    'limits.remaining': 'Verbleibend',

    // Recurring Transactions
    'recurring.title': 'Wiederkehrende Transaktionen',
    'recurring.description': 'Transaktionen, die automatisch jeden Monat hinzugefügt werden (z.B. Gehalt, Rechnungen, Abonnements).',
    'recurring.add': 'Wiederkehrende hinzufügen',
    'recurring.name': 'Transaktionsname',
    'recurring.list': 'Aktive wiederkehrende Transaktionen',
    'recurring.empty': 'Keine wiederkehrenden Transaktionen',
    'recurring.apply': 'Wiederkehrende anwenden',
    'recurring.applied': 'Wiederkehrende Transaktionen angewendet',
    'recurring.alreadyApplied': 'Bereits diesen Monat angewendet',

    // Notifications
    'notifications.title': 'Benachrichtigungen',
    'notifications.description': 'Erinnerungen für Ausgabenerfassung und Budgetwarnungen einrichten.',
    'notifications.enable': 'Benachrichtigungen aktivieren',
    'notifications.dailyReminder': 'Tägliche Erinnerung',
    'notifications.reminderTime': 'Erinnerungszeit',
    'notifications.budgetWarnings': 'Budgetwarnungen',
    'notifications.permissionRequired': 'Benachrichtigungsberechtigung erforderlich.',

    // Install
    'install.title': 'App installieren',
    'install.settingsDescription': 'Installieren Sie die App auf Ihrem Gerät für schnellen Zugriff.',
    'install.openInstructions': 'Installationsanleitung',
  },

  pl: {
    // Navigation
    'nav.home': 'Strona główna',
    'nav.monthly': 'Miesięcznie',
    'nav.archive': 'Archiwum',
    'nav.options': 'Opcje',

    // Month names
    'month.0': 'Styczeń',
    'month.1': 'Luty',
    'month.2': 'Marzec',
    'month.3': 'Kwiecień',
    'month.4': 'Maj',
    'month.5': 'Czerwiec',
    'month.6': 'Lipiec',
    'month.7': 'Sierpień',
    'month.8': 'Wrzesień',
    'month.9': 'Październik',
    'month.10': 'Listopad',
    'month.11': 'Grudzień',

    // Balance card
    'balance.current': 'Aktualny stan',
    'balance.income': 'Przychody',
    'balance.expense': 'Wydatki',
    'balance.investment': 'Inwestycje',
    'balance.savings': 'Oszczędności',

    // Transactions
    'transaction.add.income': 'Dodaj przychód',
    'transaction.add.expense': 'Dodaj wydatek',
    'transaction.add.investment': 'Dodaj inwestycję',
    'transaction.add.savings': 'Dodaj oszczędności',
    'transaction.button.income': 'przychód',
    'transaction.button.expense': 'wydatek',
    'transaction.button.investment': 'inwestycję',
    'transaction.button.savings': 'oszczędności',
    'transaction.amount': 'Kwota (€)',
    'transaction.category': 'Kategoria',
    'transaction.selectCategory': 'Wybierz kategorię',
    'transaction.categoryName': 'Nazwa kategorii',
    'transaction.categoryDesc': 'Opis kategorii (opcjonalnie)',
    'transaction.noTransactions': 'Brak transakcji',
    'transaction.lastTransactions': 'Ostatnie transakcje',
    'transaction.allTransactions': 'Wszystkie transakcje',

    // Quick expense
    'quickExpense.title': 'Szybki wydatek',
    'quickExpense.add': 'Dodaj wydatek',

    // Toasts
    'toast.income.added': 'Przychód dodany',
    'toast.expense.added': 'Wydatek dodany',
    'toast.investment.added': 'Inwestycja dodana',
    'toast.savings.added': 'Oszczędności dodane',
    'toast.transaction.removed': 'Transakcja usunięta',
    'toast.category.added': 'Kategoria dodana',
    'toast.category.removed': 'Kategoria usunięta',
    'toast.balance.transferred': 'Saldo przeniesione',
    'toast.balance.transferFailed': 'Nie można przenieść',
    'toast.balance.alreadyTransferred': 'Saldo już przeniesione lub brak salda do przeniesienia',

    // Monthly page
    'monthly.income': 'Przychody',
    'monthly.expense': 'Wydatki',
    'monthly.investment': 'Inwestycje',
    'monthly.savings': 'Oszczędności',
    'monthly.categories': 'Kategorie',
    'monthly.incomeThisMonth': 'Przychody w tym miesiącu',
    'monthly.expenseThisMonth': 'Wydatki w tym miesiącu',
    'monthly.investmentThisMonth': 'Inwestycje w tym miesiącu',
    'monthly.savingsThisMonth': 'Oszczędności w tym miesiącu',
    'monthly.carryOver': 'Przenieś saldo z poprzedniego miesiąca',
    'monthly.fromPreviousPeriod': 'Z poprzedniego okresu',
    'monthly.addFromPrevious': 'Dodaj',

    // Categories
    'category.income': 'Kategorie przychodów',
    'category.expense': 'Kategorie wydatków',
    'category.investment': 'Kategorie inwestycji',
    'category.savings': 'Kategorie oszczędności',

    // Archive
    'archive.title': 'Archiwum',
    'archive.subtitle': 'Przeglądaj poprzednie miesiące',
    'archive.noArchived': 'Brak zarchiwizowanych miesięcy',
    'archive.willAppear': 'Poprzednie miesiące pojawią się tutaj automatycznie',
    'archive.backToArchive': 'Powrót do archiwum',

    // Dialog
    'dialog.confirm': 'Czy na pewno?',
    'dialog.deleteTransaction': 'Ta akcja trwale usunie transakcję',
    'dialog.cancel': 'Anuluj',
    'dialog.delete': 'Usuń',

    // Options
    'options.title': 'Opcje',
    'options.language': 'Język',
    'options.theme': 'Motyw',
    'options.theme.light': 'Jasny',
    'options.theme.dark': 'Ciemny',

    // PDF Export
    'pdf.export': 'Pobierz PDF',
    'pdf.summary': 'Podsumowanie',
    'pdf.transactions': 'Transakcje',
    'pdf.name': 'Nazwa',
    'pdf.type': 'Typ',
    'pdf.date': 'Data',

    // Budget Limits
    'limits.title': 'Miesięczne limity',
    'limits.description': 'Ustaw limity, aby śledzić wydatki i cele oszczędnościowe.',
    'limits.expense': 'Limit wydatków',
    'limits.investment': 'Limit inwestycji',
    'limits.savings': 'Cel oszczędności',
    'limits.set': 'Ustaw limity',
    'limits.save': 'Zapisz',
    'limits.noLimit': 'Brak limitu',
    'limits.spent': 'Wydano',
    'limits.of': 'z',
    'limits.warning': 'Zbliżasz się do limitu!',
    'limits.exceeded': 'Limit przekroczony!',
    'limits.remaining': 'Pozostało',

    // Recurring Transactions
    'recurring.title': 'Transakcje cykliczne',
    'recurring.description': 'Transakcje automatycznie dodawane co miesiąc (np. wynagrodzenie, rachunki, subskrypcje).',
    'recurring.add': 'Dodaj cykliczną',
    'recurring.name': 'Nazwa transakcji',
    'recurring.list': 'Aktywne transakcje cykliczne',
    'recurring.empty': 'Brak transakcji cyklicznych',
    'recurring.apply': 'Zastosuj cykliczne',
    'recurring.applied': 'Transakcje cykliczne zastosowane',
    'recurring.alreadyApplied': 'Już zastosowano w tym miesiącu',

    // Notifications
    'notifications.title': 'Powiadomienia',
    'notifications.description': 'Ustaw przypomnienia o wydatkach i ostrzeżenia o budżecie.',
    'notifications.enable': 'Włącz powiadomienia',
    'notifications.dailyReminder': 'Codzienne przypomnienie',
    'notifications.reminderTime': 'Czas przypomnienia',
    'notifications.budgetWarnings': 'Ostrzeżenia o budżecie',
    'notifications.permissionRequired': 'Wymagana zgoda na powiadomienia.',

    // Install
    'install.title': 'Zainstaluj aplikację',
    'install.settingsDescription': 'Zainstaluj aplikację na swoim urządzeniu dla szybkiego dostępu.',
    'install.openInstructions': 'Instrukcja instalacji',
  },

  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.monthly': 'Mensual',
    'nav.archive': 'Archivo',
    'nav.options': 'Opciones',

    // Month names
    'month.0': 'Enero',
    'month.1': 'Febrero',
    'month.2': 'Marzo',
    'month.3': 'Abril',
    'month.4': 'Mayo',
    'month.5': 'Junio',
    'month.6': 'Julio',
    'month.7': 'Agosto',
    'month.8': 'Septiembre',
    'month.9': 'Octubre',
    'month.10': 'Noviembre',
    'month.11': 'Diciembre',

    // Balance card
    'balance.current': 'Saldo actual',
    'balance.income': 'Ingresos',
    'balance.expense': 'Gastos',
    'balance.investment': 'Inversiones',
    'balance.savings': 'Ahorros',

    // Transactions
    'transaction.add.income': 'Añadir ingreso',
    'transaction.add.expense': 'Añadir gasto',
    'transaction.add.investment': 'Añadir inversión',
    'transaction.add.savings': 'Añadir ahorro',
    'transaction.button.income': 'ingreso',
    'transaction.button.expense': 'gasto',
    'transaction.button.investment': 'inversión',
    'transaction.button.savings': 'ahorro',
    'transaction.amount': 'Cantidad (€)',
    'transaction.category': 'Categoría',
    'transaction.selectCategory': 'Seleccionar categoría',
    'transaction.categoryName': 'Nombre de categoría',
    'transaction.categoryDesc': 'Descripción de categoría (opcional)',
    'transaction.noTransactions': 'Sin transacciones',
    'transaction.lastTransactions': 'Transacciones recientes',
    'transaction.allTransactions': 'Todas las transacciones',

    // Quick expense
    'quickExpense.title': 'Gasto rápido',
    'quickExpense.add': 'Añadir gasto',

    // Toasts
    'toast.income.added': 'Ingreso añadido',
    'toast.expense.added': 'Gasto añadido',
    'toast.investment.added': 'Inversión añadida',
    'toast.savings.added': 'Ahorro añadido',
    'toast.transaction.removed': 'Transacción eliminada',
    'toast.category.added': 'Categoría añadida',
    'toast.category.removed': 'Categoría eliminada',
    'toast.balance.transferred': 'Saldo transferido',
    'toast.balance.transferFailed': 'No se puede transferir',
    'toast.balance.alreadyTransferred': 'Saldo ya transferido o sin saldo para transferir',

    // Monthly page
    'monthly.income': 'Ingresos',
    'monthly.expense': 'Gastos',
    'monthly.investment': 'Inversiones',
    'monthly.savings': 'Ahorros',
    'monthly.categories': 'Categorías',
    'monthly.incomeThisMonth': 'Ingresos este mes',
    'monthly.expenseThisMonth': 'Gastos este mes',
    'monthly.investmentThisMonth': 'Inversiones este mes',
    'monthly.savingsThisMonth': 'Ahorros este mes',
    'monthly.carryOver': 'Transferir saldo del mes anterior',
    'monthly.fromPreviousPeriod': 'Del período anterior',
    'monthly.addFromPrevious': 'Añadir',

    // Categories
    'category.income': 'Categorías de ingresos',
    'category.expense': 'Categorías de gastos',
    'category.investment': 'Categorías de inversiones',
    'category.savings': 'Categorías de ahorros',

    // Archive
    'archive.title': 'Archivo',
    'archive.subtitle': 'Navegar por meses anteriores',
    'archive.noArchived': 'Sin meses archivados',
    'archive.willAppear': 'Los meses anteriores aparecerán automáticamente aquí',
    'archive.backToArchive': 'Volver al archivo',

    // Dialog
    'dialog.confirm': '¿Estás seguro?',
    'dialog.deleteTransaction': 'Esta acción eliminará permanentemente la transacción',
    'dialog.cancel': 'Cancelar',
    'dialog.delete': 'Eliminar',

    // Options
    'options.title': 'Opciones',
    'options.language': 'Idioma',
    'options.theme': 'Tema',
    'options.theme.light': 'Claro',
    'options.theme.dark': 'Oscuro',

    // PDF Export
    'pdf.export': 'Descargar PDF',
    'pdf.summary': 'Resumen',
    'pdf.transactions': 'Transacciones',
    'pdf.name': 'Nombre',
    'pdf.type': 'Tipo',
    'pdf.date': 'Fecha',

    // Budget Limits
    'limits.title': 'Límites mensuales',
    'limits.description': 'Establece límites para rastrear gastos y metas de ahorro.',
    'limits.expense': 'Límite de gastos',
    'limits.investment': 'Límite de inversiones',
    'limits.savings': 'Meta de ahorro',
    'limits.set': 'Establecer límites',
    'limits.save': 'Guardar',
    'limits.noLimit': 'Sin límite',
    'limits.spent': 'Gastado',
    'limits.of': 'de',
    'limits.warning': '¡Acercándose al límite!',
    'limits.exceeded': '¡Límite excedido!',
    'limits.remaining': 'Restante',

    // Recurring Transactions
    'recurring.title': 'Transacciones recurrentes',
    'recurring.description': 'Transacciones que se añaden automáticamente cada mes (ej. salario, facturas, suscripciones).',
    'recurring.add': 'Añadir recurrente',
    'recurring.name': 'Nombre de transacción',
    'recurring.list': 'Transacciones recurrentes activas',
    'recurring.empty': 'Sin transacciones recurrentes',
    'recurring.apply': 'Aplicar recurrentes',
    'recurring.applied': 'Transacciones recurrentes aplicadas',
    'recurring.alreadyApplied': 'Ya aplicado este mes',

    // Notifications
    'notifications.title': 'Notificaciones',
    'notifications.description': 'Configura recordatorios para gastos y alertas de presupuesto.',
    'notifications.enable': 'Habilitar notificaciones',
    'notifications.dailyReminder': 'Recordatorio diario',
    'notifications.reminderTime': 'Hora del recordatorio',
    'notifications.budgetWarnings': 'Alertas de presupuesto',
    'notifications.permissionRequired': 'Se requiere permiso de notificaciones.',

    // Install
    'install.title': 'Instalar aplicación',
    'install.settingsDescription': 'Instala la aplicación en tu dispositivo para acceso rápido.',
    'install.openInstructions': 'Instrucciones de instalación',
  },

  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.monthly': 'Mensuel',
    'nav.archive': 'Archives',
    'nav.options': 'Options',

    // Month names
    'month.0': 'Janvier',
    'month.1': 'Février',
    'month.2': 'Mars',
    'month.3': 'Avril',
    'month.4': 'Mai',
    'month.5': 'Juin',
    'month.6': 'Juillet',
    'month.7': 'Août',
    'month.8': 'Septembre',
    'month.9': 'Octobre',
    'month.10': 'Novembre',
    'month.11': 'Décembre',

    // Balance card
    'balance.current': 'Solde actuel',
    'balance.income': 'Revenus',
    'balance.expense': 'Dépenses',
    'balance.investment': 'Investissements',
    'balance.savings': 'Épargne',

    // Transactions
    'transaction.add.income': 'Ajouter un revenu',
    'transaction.add.expense': 'Ajouter une dépense',
    'transaction.add.investment': 'Ajouter un investissement',
    'transaction.add.savings': "Ajouter de l'épargne",
    'transaction.button.income': 'revenu',
    'transaction.button.expense': 'dépense',
    'transaction.button.investment': 'investissement',
    'transaction.button.savings': 'épargne',
    'transaction.amount': 'Montant (€)',
    'transaction.category': 'Catégorie',
    'transaction.selectCategory': 'Sélectionner une catégorie',
    'transaction.categoryName': 'Nom de la catégorie',
    'transaction.categoryDesc': 'Description de la catégorie (optionnel)',
    'transaction.noTransactions': 'Aucune transaction',
    'transaction.lastTransactions': 'Transactions récentes',
    'transaction.allTransactions': 'Toutes les transactions',

    // Quick expense
    'quickExpense.title': 'Dépense rapide',
    'quickExpense.add': 'Ajouter une dépense',

    // Toasts
    'toast.income.added': 'Revenu ajouté',
    'toast.expense.added': 'Dépense ajoutée',
    'toast.investment.added': 'Investissement ajouté',
    'toast.savings.added': 'Épargne ajoutée',
    'toast.transaction.removed': 'Transaction supprimée',
    'toast.category.added': 'Catégorie ajoutée',
    'toast.category.removed': 'Catégorie supprimée',
    'toast.balance.transferred': 'Solde transféré',
    'toast.balance.transferFailed': 'Transfert impossible',
    'toast.balance.alreadyTransferred': 'Solde déjà transféré ou aucun solde à transférer',

    // Monthly page
    'monthly.income': 'Revenus',
    'monthly.expense': 'Dépenses',
    'monthly.investment': 'Investissements',
    'monthly.savings': 'Épargne',
    'monthly.categories': 'Catégories',
    'monthly.incomeThisMonth': 'Revenus ce mois',
    'monthly.expenseThisMonth': 'Dépenses ce mois',
    'monthly.investmentThisMonth': 'Investissements ce mois',
    'monthly.savingsThisMonth': 'Épargne ce mois',
    'monthly.carryOver': 'Reporter le solde du mois précédent',
    'monthly.fromPreviousPeriod': 'De la période précédente',
    'monthly.addFromPrevious': 'Ajouter',

    // Categories
    'category.income': 'Catégories de revenus',
    'category.expense': 'Catégories de dépenses',
    'category.investment': "Catégories d'investissements",
    'category.savings': "Catégories d'épargne",

    // Archive
    'archive.title': 'Archives',
    'archive.subtitle': 'Parcourir les mois précédents',
    'archive.noArchived': 'Aucun mois archivé',
    'archive.willAppear': 'Les mois précédents apparaîtront automatiquement ici',
    'archive.backToArchive': 'Retour aux archives',

    // Dialog
    'dialog.confirm': 'Êtes-vous sûr?',
    'dialog.deleteTransaction': 'Cette action supprimera définitivement la transaction',
    'dialog.cancel': 'Annuler',
    'dialog.delete': 'Supprimer',

    // Options
    'options.title': 'Options',
    'options.language': 'Langue',
    'options.theme': 'Thème',
    'options.theme.light': 'Clair',
    'options.theme.dark': 'Sombre',

    // PDF Export
    'pdf.export': 'Télécharger PDF',
    'pdf.summary': 'Résumé',
    'pdf.transactions': 'Transactions',
    'pdf.name': 'Nom',
    'pdf.type': 'Type',
    'pdf.date': 'Date',

    // Budget Limits
    'limits.title': 'Limites mensuelles',
    'limits.description': 'Définissez des limites pour suivre les dépenses et les objectifs d\'épargne.',
    'limits.expense': 'Limite de dépenses',
    'limits.investment': 'Limite d\'investissement',
    'limits.savings': 'Objectif d\'épargne',
    'limits.set': 'Définir les limites',
    'limits.save': 'Enregistrer',
    'limits.noLimit': 'Pas de limite',
    'limits.spent': 'Dépensé',
    'limits.of': 'sur',
    'limits.warning': 'Approche de la limite!',
    'limits.exceeded': 'Limite dépassée!',
    'limits.remaining': 'Restant',

    // Recurring Transactions
    'recurring.title': 'Transactions récurrentes',
    'recurring.description': 'Transactions automatiquement ajoutées chaque mois (ex. salaire, factures, abonnements).',
    'recurring.add': 'Ajouter récurrente',
    'recurring.name': 'Nom de la transaction',
    'recurring.list': 'Transactions récurrentes actives',
    'recurring.empty': 'Aucune transaction récurrente',
    'recurring.apply': 'Appliquer récurrentes',
    'recurring.applied': 'Transactions récurrentes appliquées',
    'recurring.alreadyApplied': 'Déjà appliqué ce mois-ci',

    // Notifications
    'notifications.title': 'Notifications',
    'notifications.description': 'Configurez des rappels pour les dépenses et les alertes de budget.',
    'notifications.enable': 'Activer les notifications',
    'notifications.dailyReminder': 'Rappel quotidien',
    'notifications.reminderTime': 'Heure du rappel',
    'notifications.budgetWarnings': 'Alertes de budget',
    'notifications.permissionRequired': 'Autorisation de notification requise.',

    // Install
    'install.title': 'Installer l\'application',
    'install.settingsDescription': 'Installez l\'application sur votre appareil pour un accès rapide.',
    'install.openInstructions': 'Instructions d\'installation',
  },
};

export const languageNames: Record<Language, { name: string; flag: string }> = {
  hr: { name: 'Hrvatski', flag: '🇭🇷' },
  en: { name: 'English', flag: '🇬🇧' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  pl: { name: 'Polski', flag: '🇵🇱' },
  es: { name: 'Español', flag: '🇪🇸' },
  fr: { name: 'Français', flag: '🇫🇷' },
};
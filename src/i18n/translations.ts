export type Language = 'hr' | 'en' | 'de' | 'pl' | 'es' | 'fr';

export const translations: Record<Language, Record<string, string>> = {
  hr: {
    // Navigation
    'nav.home': 'Početna',
    'nav.monthly': 'Mjesečno',
    'nav.accounts': 'Računi',
    'nav.archive': 'Arhiva',
    'nav.options': 'Opcije',

    // Accounts
    'accounts.title': 'Računi',
    'accounts.description': 'Upravljaj bankovnim računima i novčanicima',
    'accounts.add': 'Dodaj račun',
    'accounts.addDescription': 'Dodaj novi bankovni račun ili novčanik',
    'accounts.name': 'Naziv računa',
    'accounts.balance': 'Stanje (€)',
    'accounts.list': 'Moji računi',
    'accounts.empty': 'Nema dodanih računa',
    'accounts.added': 'Račun dodan',
    'accounts.removed': 'Račun uklonjen',
    'accounts.updated': 'Račun ažuriran',
    'accounts.totalBalance': 'Ukupno stanje',
    'accounts.selectAccount': 'Odaberi račun',
    'accounts.noAccount': 'Bez računa',
    'transaction.selectAccount': 'Odaberi račun',

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
    'toast.balance.autoTransferred': 'Automatski preneseno stanje iz prethodnog mjeseca',

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
    'archive.deleted': 'Mjesec obrisan',
    'archive.deleteConfirm': 'Obriši mjesec?',
    'archive.deleteWarning': 'Ova radnja će trajno obrisati sve podatke za',

    // Common
    'common.cancel': 'Odustani',
    'common.delete': 'Obriši',

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
    'recurring.description': 'Transakcije koje se automatski dodaju svakog 1. u mjesecu (npr. plaća, režije, pretplate).',
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

    // Transfer
    'transfer.toBalance': 'Na stanje',
    'transfer.fromInvestment': 'Prijenos iz investicija',
    'transfer.fromSavings': 'Prijenos iz štednje',
    'transfer.available': 'Dostupno',
    'transfer.enterAmount': 'Unesite iznos',
    'transfer.exceedsAvailable': 'Iznos premašuje dostupni saldo',
    'transfer.invalidAmount': 'Unesite ispravan iznos',
    'transfer.confirm': 'Prenesi',
    'transfer.success': 'Sredstva prenesena na stanje',
  },

  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.monthly': 'Monthly',
    'nav.accounts': 'Accounts',
    'nav.archive': 'Archive',
    'nav.options': 'Options',

    // Accounts
    'accounts.title': 'Accounts',
    'accounts.description': 'Manage bank accounts and wallets',
    'accounts.add': 'Add account',
    'accounts.addDescription': 'Add a new bank account or wallet',
    'accounts.name': 'Account name',
    'accounts.balance': 'Balance (€)',
    'accounts.list': 'My accounts',
    'accounts.empty': 'No accounts added',
    'accounts.added': 'Account added',
    'accounts.removed': 'Account removed',
    'accounts.updated': 'Account updated',
    'accounts.totalBalance': 'Total balance',
    'accounts.selectAccount': 'Select account',
    'accounts.noAccount': 'No account',
    'transaction.selectAccount': 'Select account',

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
    'toast.balance.autoTransferred': 'Balance automatically transferred from previous month',

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
    'archive.deleted': 'Month deleted',
    'archive.deleteConfirm': 'Delete month?',
    'archive.deleteWarning': 'This action will permanently delete all data for',

    // Common
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',

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
    'recurring.description': 'Transactions automatically added on the 1st of each month (e.g., salary, bills, subscriptions).',
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

    // Transfer
    'transfer.toBalance': 'To balance',
    'transfer.fromInvestment': 'Transfer from investments',
    'transfer.fromSavings': 'Transfer from savings',
    'transfer.available': 'Available',
    'transfer.enterAmount': 'Enter amount',
    'transfer.exceedsAvailable': 'Amount exceeds available balance',
    'transfer.invalidAmount': 'Enter a valid amount',
    'transfer.confirm': 'Transfer',
    'transfer.success': 'Funds transferred to balance',
  },

  de: {
    // Navigation
    'nav.home': 'Startseite',
    'nav.monthly': 'Monatlich',
    'nav.accounts': 'Konten',
    'nav.archive': 'Archiv',
    'nav.options': 'Optionen',

    // Accounts
    'accounts.title': 'Konten',
    'accounts.description': 'Verwalten Sie Bankkonten und Geldbörsen',
    'accounts.add': 'Konto hinzufügen',
    'accounts.addDescription': 'Neues Bankkonto oder Geldbörse hinzufügen',
    'accounts.name': 'Kontoname',
    'accounts.balance': 'Kontostand (€)',
    'accounts.list': 'Meine Konten',
    'accounts.empty': 'Keine Konten hinzugefügt',
    'accounts.added': 'Konto hinzugefügt',
    'accounts.removed': 'Konto entfernt',
    'accounts.updated': 'Konto aktualisiert',
    'accounts.totalBalance': 'Gesamtkontostand',
    'accounts.selectAccount': 'Konto auswählen',
    'accounts.noAccount': 'Kein Konto',
    'transaction.selectAccount': 'Konto auswählen',

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
    'toast.balance.autoTransferred': 'Saldo automatisch vom Vormonat übertragen',

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
    'archive.deleted': 'Monat gelöscht',
    'archive.deleteConfirm': 'Monat löschen?',
    'archive.deleteWarning': 'Diese Aktion löscht dauerhaft alle Daten für',

    // Common
    'common.cancel': 'Abbrechen',
    'common.delete': 'Löschen',

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
    'recurring.description': 'Transaktionen, die automatisch am 1. jedes Monats hinzugefügt werden (z.B. Gehalt, Rechnungen, Abonnements).',
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

    // Transfer
    'transfer.toBalance': 'Zum Kontostand',
    'transfer.fromInvestment': 'Überweisung aus Investitionen',
    'transfer.fromSavings': 'Überweisung aus Ersparnissen',
    'transfer.available': 'Verfügbar',
    'transfer.enterAmount': 'Betrag eingeben',
    'transfer.exceedsAvailable': 'Betrag übersteigt verfügbares Guthaben',
    'transfer.invalidAmount': 'Gültigen Betrag eingeben',
    'transfer.confirm': 'Überweisen',
    'transfer.success': 'Geld auf Kontostand übertragen',
  },

  pl: {
    // Navigation
    'nav.home': 'Strona główna',
    'nav.monthly': 'Miesięcznie',
    'nav.accounts': 'Konta',
    'nav.archive': 'Archiwum',
    'nav.options': 'Opcje',

    // Accounts
    'accounts.title': 'Konta',
    'accounts.description': 'Zarządzaj kontami bankowymi i portfelami',
    'accounts.add': 'Dodaj konto',
    'accounts.addDescription': 'Dodaj nowe konto bankowe lub portfel',
    'accounts.name': 'Nazwa konta',
    'accounts.balance': 'Saldo (€)',
    'accounts.list': 'Moje konta',
    'accounts.empty': 'Brak dodanych kont',
    'accounts.added': 'Konto dodane',
    'accounts.removed': 'Konto usunięte',
    'accounts.updated': 'Konto zaktualizowane',
    'accounts.totalBalance': 'Saldo całkowite',
    'accounts.selectAccount': 'Wybierz konto',
    'accounts.noAccount': 'Brak konta',
    'transaction.selectAccount': 'Wybierz konto',

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
    'toast.balance.autoTransferred': 'Saldo automatycznie przeniesione z poprzedniego miesiąca',

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
    'archive.deleted': 'Miesiąc usunięty',
    'archive.deleteConfirm': 'Usunąć miesiąc?',
    'archive.deleteWarning': 'Ta akcja trwale usunie wszystkie dane za',

    // Common
    'common.cancel': 'Anuluj',
    'common.delete': 'Usuń',

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
    'recurring.description': 'Transakcje automatycznie dodawane 1. dnia każdego miesiąca (np. wynagrodzenie, rachunki, subskrypcje).',
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

    // Transfer
    'transfer.toBalance': 'Na saldo',
    'transfer.fromInvestment': 'Przelew z inwestycji',
    'transfer.fromSavings': 'Przelew z oszczędności',
    'transfer.available': 'Dostępne',
    'transfer.enterAmount': 'Wprowadź kwotę',
    'transfer.exceedsAvailable': 'Kwota przekracza dostępne saldo',
    'transfer.invalidAmount': 'Wprowadź prawidłową kwotę',
    'transfer.confirm': 'Prześlij',
    'transfer.success': 'Środki przelane na saldo',
  },

  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.monthly': 'Mensual',
    'nav.accounts': 'Cuentas',
    'nav.archive': 'Archivo',
    'nav.options': 'Opciones',

    // Accounts
    'accounts.title': 'Cuentas',
    'accounts.description': 'Gestiona cuentas bancarias y billeteras',
    'accounts.add': 'Añadir cuenta',
    'accounts.addDescription': 'Añadir nueva cuenta bancaria o billetera',
    'accounts.name': 'Nombre de cuenta',
    'accounts.balance': 'Saldo (€)',
    'accounts.list': 'Mis cuentas',
    'accounts.empty': 'No hay cuentas añadidas',
    'accounts.added': 'Cuenta añadida',
    'accounts.removed': 'Cuenta eliminada',
    'accounts.updated': 'Cuenta actualizada',
    'accounts.totalBalance': 'Saldo total',
    'accounts.selectAccount': 'Seleccionar cuenta',
    'accounts.noAccount': 'Sin cuenta',
    'transaction.selectAccount': 'Seleccionar cuenta',

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
    'toast.balance.autoTransferred': 'Saldo transferido automáticamente del mes anterior',

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
    'archive.deleted': 'Mes eliminado',
    'archive.deleteConfirm': '¿Eliminar mes?',
    'archive.deleteWarning': 'Esta acción eliminará permanentemente todos los datos de',

    // Common
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',

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
    'recurring.description': 'Transacciones que se añaden automáticamente el 1 de cada mes (ej. salario, facturas, suscripciones).',
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

    // Transfer
    'transfer.toBalance': 'Al saldo',
    'transfer.fromInvestment': 'Transferencia de inversiones',
    'transfer.fromSavings': 'Transferencia de ahorros',
    'transfer.available': 'Disponible',
    'transfer.enterAmount': 'Ingrese el monto',
    'transfer.exceedsAvailable': 'El monto excede el saldo disponible',
    'transfer.invalidAmount': 'Ingrese un monto válido',
    'transfer.confirm': 'Transferir',
    'transfer.success': 'Fondos transferidos al saldo',
  },

  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.monthly': 'Mensuel',
    'nav.accounts': 'Comptes',
    'nav.archive': 'Archives',
    'nav.options': 'Options',

    // Accounts
    'accounts.title': 'Comptes',
    'accounts.description': 'Gérer les comptes bancaires et portefeuilles',
    'accounts.add': 'Ajouter un compte',
    'accounts.addDescription': 'Ajouter un nouveau compte bancaire ou portefeuille',
    'accounts.name': 'Nom du compte',
    'accounts.balance': 'Solde (€)',
    'accounts.list': 'Mes comptes',
    'accounts.empty': 'Aucun compte ajouté',
    'accounts.added': 'Compte ajouté',
    'accounts.removed': 'Compte supprimé',
    'accounts.updated': 'Compte mis à jour',
    'accounts.totalBalance': 'Solde total',
    'accounts.selectAccount': 'Sélectionner un compte',
    'accounts.noAccount': 'Aucun compte',
    'transaction.selectAccount': 'Sélectionner un compte',

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
    'toast.balance.autoTransferred': 'Solde automatiquement transféré du mois précédent',

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
    'archive.deleted': 'Mois supprimé',
    'archive.deleteConfirm': 'Supprimer le mois?',
    'archive.deleteWarning': 'Cette action supprimera définitivement toutes les données de',

    // Common
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',

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
    'recurring.description': 'Transactions automatiquement ajoutées le 1er de chaque mois (ex. salaire, factures, abonnements).',
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

    // Transfer
    'transfer.toBalance': 'Vers le solde',
    'transfer.fromInvestment': 'Transfert des investissements',
    'transfer.fromSavings': 'Transfert de l\'épargne',
    'transfer.available': 'Disponible',
    'transfer.enterAmount': 'Entrez le montant',
    'transfer.exceedsAvailable': 'Le montant dépasse le solde disponible',
    'transfer.invalidAmount': 'Entrez un montant valide',
    'transfer.confirm': 'Transférer',
    'transfer.success': 'Fonds transférés au solde',
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
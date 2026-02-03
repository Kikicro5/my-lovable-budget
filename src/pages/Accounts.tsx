import { useState } from 'react';
import { useBudget } from '@/hooks/useBudget';
import { BottomNavigation } from '@/components/BottomNavigation';
import { AdsterraBanner } from '@/components/AdsterraBanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Plus, Wallet, Trash2, Edit2, Check, X, ArrowRightLeft, Target } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { cn } from '@/lib/utils';
import { BudgetLimitsForm } from '@/components/BudgetLimitsForm';
import { ReminderForm } from '@/components/ReminderForm';

const Accounts = () => {
  const { state, addAccount, removeAccount, updateAccount, transferBetweenAccounts, addReminder, removeReminder } = useBudget();
  const { t } = useLanguage();
  const { currencySymbol } = useCurrency();
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountBalance, setNewAccountBalance] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editBalance, setEditBalance] = useState('');
  
  // Transfer state
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountName.trim()) return;

    addAccount({
      name: newAccountName.trim(),
      balance: parseFloat(newAccountBalance) || 0,
    });

    toast({
      title: t('accounts.added'),
      description: newAccountName,
    });

    setNewAccountName('');
    setNewAccountBalance('');
  };

  const handleRemoveAccount = (id: string, name: string) => {
    removeAccount(id);
    toast({
      title: t('accounts.removed'),
      description: name,
      variant: 'destructive',
    });
  };

  const handleStartEdit = (account: { id: string; name: string; balance: number }) => {
    setEditingId(account.id);
    setEditName(account.name);
    setEditBalance(account.balance.toString());
  };

  const handleSaveEdit = () => {
    if (!editingId || !editName.trim()) return;

    updateAccount(editingId, {
      name: editName.trim(),
      balance: parseFloat(editBalance) || 0,
    });

    toast({
      title: t('accounts.updated'),
      description: editName,
    });

    setEditingId(null);
    setEditName('');
    setEditBalance('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditBalance('');
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(transferAmount);
    if (!fromAccountId || !toAccountId || fromAccountId === toAccountId || !amount || amount <= 0) {
      return;
    }

    const success = transferBetweenAccounts(fromAccountId, toAccountId, amount);
    if (success) {
      const fromAccount = state.accounts?.find((a) => a.id === fromAccountId);
      const toAccount = state.accounts?.find((a) => a.id === toAccountId);
      toast({
        title: t('accounts.transferSuccess'),
        description: `${amount.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} ${currencySymbol} (${fromAccount?.name} → ${toAccount?.name})`,
      });
      setFromAccountId('');
      setToAccountId('');
      setTransferAmount('');
    } else {
      toast({
        title: t('accounts.transferFailed'),
        description: t('accounts.insufficientFunds'),
        variant: 'destructive',
      });
    }
  };

  const fromAccount = state.accounts?.find((a) => a.id === fromAccountId);
  const canTransfer = fromAccountId && toAccountId && fromAccountId !== toAccountId && 
    parseFloat(transferAmount) > 0 && fromAccount && parseFloat(transferAmount) <= fromAccount.balance;

  const totalBalance = state.accounts?.reduce((sum, acc) => sum + acc.balance, 0) || 0;

  return (
    <div className="min-h-screen bg-background pb-24 pt-4">
      <div className="max-w-lg mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold text-foreground">{t('accounts.title')}</h1>
          <p className="text-muted-foreground text-sm">{t('accounts.description')}</p>
        </div>

        <AdsterraBanner bannerAdKey="cfe2d16dc1c1e9c2a105c4ab7e9d1880" width={728} height={90} />
        {/* Total Balance Card */}
        <Card className="mb-6 bg-primary/10 border-primary/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary">
                  <Wallet className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('accounts.totalBalance')}</p>
                  <p className="text-xl font-bold text-foreground">
                    {totalBalance.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} {currencySymbol}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Account Form */}
        <Card className="mb-6 shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="w-5 h-5" />
              {t('accounts.add')}
            </CardTitle>
            <CardDescription>{t('accounts.addDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddAccount} className="space-y-3">
              <Input
                placeholder={t('accounts.name')}
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
                className="bg-background"
              />
              <Input
                type="number"
                step="0.01"
                placeholder={t('accounts.balance')}
                value={newAccountBalance}
                onChange={(e) => setNewAccountBalance(e.target.value)}
                className="bg-background"
              />
              <Button type="submit" className="w-full" disabled={!newAccountName.trim()}>
                <Plus className="w-4 h-4 mr-2" />
                {t('accounts.add')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Transfer Between Accounts */}
        {state.accounts && state.accounts.length >= 2 && (
          <Card className="mb-6 shadow-soft border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5" />
                {t('accounts.transfer')}
              </CardTitle>
              <CardDescription>{t('accounts.transferDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTransfer} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">{t('accounts.from')}</label>
                    <Select value={fromAccountId} onValueChange={setFromAccountId}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder={t('accounts.selectAccount')} />
                      </SelectTrigger>
                      <SelectContent>
                        {state.accounts.filter((a) => a.id !== toAccountId).map((acc) => (
                          <SelectItem key={acc.id} value={acc.id}>
                            <div className="flex justify-between items-center gap-2">
                              <span>{acc.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({acc.balance.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} {currencySymbol})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">{t('accounts.to')}</label>
                    <Select value={toAccountId} onValueChange={setToAccountId}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder={t('accounts.selectAccount')} />
                      </SelectTrigger>
                      <SelectContent>
                        {state.accounts.filter((a) => a.id !== fromAccountId).map((acc) => (
                          <SelectItem key={acc.id} value={acc.id}>
                            <div className="flex justify-between items-center gap-2">
                              <span>{acc.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({acc.balance.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} {currencySymbol})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max={fromAccount?.balance || 0}
                  placeholder={t('accounts.transferAmount')}
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="bg-background"
                />
                <Button type="submit" className="w-full" disabled={!canTransfer}>
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  {t('accounts.transferButton')}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Accounts List */}
        <Card className="mb-6 shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{t('accounts.list')}</CardTitle>
          </CardHeader>
          <CardContent>
            {(!state.accounts || state.accounts.length === 0) ? (
              <p className="text-muted-foreground text-center py-4">{t('accounts.empty')}</p>
            ) : (
              <div className="space-y-2">
                {state.accounts.map((account) => (
                  <div
                    key={account.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border bg-card",
                      editingId === account.id && "ring-2 ring-primary"
                    )}
                  >
                    {editingId === account.id ? (
                      <div className="flex-1 flex items-center gap-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 h-8"
                          autoFocus
                        />
                        <Input
                          type="number"
                          step="0.01"
                          value={editBalance}
                          onChange={(e) => setEditBalance(e.target.value)}
                          className="w-28 h-8"
                        />
                        <Button size="icon" variant="ghost" onClick={handleSaveEdit} className="h-8 w-8">
                          <Check className="w-4 h-4 text-income" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={handleCancelEdit} className="h-8 w-8">
                          <X className="w-4 h-4 text-expense" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-muted">
                            <Wallet className="w-4 h-4 text-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{account.name}</p>
                            <p className={cn(
                              "text-sm",
                              account.balance >= 0 ? "text-income" : "text-expense"
                            )}>
                              {account.balance.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} {currencySymbol}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleStartEdit(account)}
                            className="h-8 w-8"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleRemoveAccount(account.id, account.name)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Reminders */}
        {state.accounts && state.accounts.length > 0 && (
          <ReminderForm
            categories={state.savedCategories.expense}
            accounts={state.accounts}
            reminders={state.reminders || []}
            onSubmit={(reminder) => {
              addReminder(reminder);
              toast({ title: t('reminder.add') });
            }}
            onRemove={(id) => {
              removeReminder(id);
              toast({ title: t('common.delete'), variant: 'destructive' });
            }}
          />
        )}

        {/* Budget Limits */}
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              {t('limits.title')}
            </CardTitle>
            <CardDescription>{t('limits.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <BudgetLimitsForm />
          </CardContent>
        </Card>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Accounts;

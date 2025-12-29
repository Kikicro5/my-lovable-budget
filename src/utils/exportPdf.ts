import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { MonthlyBudget, Transaction } from '@/types/budget';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: unknown) => jsPDF;
  }
}

interface ExportOptions {
  budget: MonthlyBudget;
  monthName: string;
  labels: {
    income: string;
    expense: string;
    investment: string;
    savings: string;
    balance: string;
    transactions: string;
    name: string;
    category: string;
    amount: string;
    type: string;
    date: string;
    summary: string;
  };
}

export const exportBudgetToPDF = ({ budget, monthName, labels }: ExportOptions) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.text(`${monthName} ${budget.year}`, 14, 22);
  
  // Summary
  doc.setFontSize(12);
  doc.text(labels.summary, 14, 35);
  
  const income = budget.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expense = budget.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const investment = budget.transactions.filter(t => t.type === 'investment').reduce((sum, t) => sum + t.amount, 0);
  const savings = budget.transactions.filter(t => t.type === 'savings').reduce((sum, t) => sum + t.amount, 0);
  const balance = income - expense - investment - savings;
  
  const summaryData = [
    [labels.income, `+${income.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €`],
    [labels.expense, `-${expense.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €`],
    [labels.investment, `${investment.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €`],
    [labels.savings, `${savings.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €`],
    [labels.balance, `${balance.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €`],
  ];
  
  doc.autoTable({
    startY: 40,
    head: [],
    body: summaryData,
    theme: 'grid',
    styles: { fontSize: 10 },
    columnStyles: { 0: { fontStyle: 'bold' } },
  });
  
  // Transactions table
  const tableStartY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
  doc.text(labels.transactions, 14, tableStartY);
  
  const typeLabels: Record<string, string> = {
    income: labels.income,
    expense: labels.expense,
    investment: labels.investment,
    savings: labels.savings,
  };
  
  const transactionData = budget.transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((t: Transaction) => [
      t.name,
      t.category,
      typeLabels[t.type] || t.type,
      `${t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €`,
      new Date(t.date).toLocaleDateString('hr-HR'),
    ]);
  
  doc.autoTable({
    startY: tableStartY + 5,
    head: [[labels.name, labels.category, labels.type, labels.amount, labels.date]],
    body: transactionData,
    theme: 'striped',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [59, 130, 246] },
  });
  
  doc.save(`budzet-${budget.year}-${(budget.month + 1).toString().padStart(2, '0')}.pdf`);
};
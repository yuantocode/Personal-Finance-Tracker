import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

import Header from "./components/Header";
import SummaryCards from "./components/SummaryCards";
import TransactionForm from "./components/TransactionForm";
import HistoryPanel from "./components/HistoryPanel";
import BackupControls from "./components/BackupControls";

import { loadJSON, saveJSON } from "./utils/storage";
import { isInMonth } from "./utils/date";

function toSignedAmount(type, amount) {
  const v = Number(amount);
  if (!Number.isFinite(v)) return 0;
  return type === "Expense" ? -Math.abs(v) : Math.abs(v);
}

export default function App() {
  const [transactions, setTransactions] = useState(() => loadJSON("transactions", []));
  const [filterMonth, setFilterMonth] = useState(() => localStorage.getItem("filterMonth") || "");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");

  const [showHistory, setShowHistory] = useState(true);

  // Persist
  useEffect(() => saveJSON("transactions", transactions), [transactions]);

  useEffect(() => {
    localStorage.setItem("filterMonth", filterMonth);
  }, [filterMonth]);

  useEffect(() => {
    localStorage.setItem("darkMode", String(darkMode));
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const filteredTransactions = useMemo(() => {
    if (!filterMonth) return transactions;
    return transactions.filter((t) => isInMonth(t.date, filterMonth));
  }, [transactions, filterMonth]);

  const { income, expenses, balance } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    for (const t of filteredTransactions) {
      if (t.amount >= 0) inc += t.amount;
      else exp += t.amount;
    }
    return { income: inc, expenses: exp, balance: inc + exp };
  }, [filteredTransactions]);

  const addTransaction = ({ text, amount, type, category, date }) => {
    const signedAmount = toSignedAmount(type, amount);

    const tx = {
      id: (crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`),
      text,
      amount: signedAmount,
      category,
      date,
    };

    setTransactions((prev) => [tx, ...prev]);
  };

  const deleteTransaction = (id) => {
    const tx = transactions.find((t) => t.id === id);
    const ok = window.confirm(`Delete "${tx?.text || "this transaction"}"?`);
    if (!ok) return;

    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="app-container">
      <Header
        filterMonth={filterMonth}
        setFilterMonth={setFilterMonth}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <SummaryCards
        income={income}
        expensesAbs={Math.abs(expenses)}
        balance={balance}
      />

      <TransactionForm onAdd={addTransaction} />

      <div className="toggle-panels">
        <button className="ghost" onClick={() => setShowHistory((v) => !v)}>
          {showHistory ? "Hide History" : "Show History"}
        </button>
      </div>

      {/* ✅ Backup controls are now USED here */}
      <BackupControls transactions={transactions} setTransactions={setTransactions} />

      <HistoryPanel
        visible={showHistory}
        transactions={filteredTransactions}
        onDelete={deleteTransaction}
      />
    </div>
  );
}
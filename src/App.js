import React, { useEffect, useMemo, useState, useCallback } from "react";
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
  const [transactions, setTransactions] = useState(() =>
    loadJSON("transactions", [])
  );
  const [filterMonth, setFilterMonth] = useState(
    () => localStorage.getItem("filterMonth") || ""
  );
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true"
  );
  const [showHistory, setShowHistory] = useState(true);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const notify = useCallback((message, type = "success") => {
    setToast({
      show: true,
      message,
      type,
    });
  }, []);

  useEffect(() => {
    if (!toast.show) return;

    const timer = setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 2600);

    return () => clearTimeout(timer);
  }, [toast.show]);

  useEffect(() => {
    saveJSON("transactions", transactions);
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("filterMonth", filterMonth);
  }, [filterMonth]);

  useEffect(() => {
    localStorage.setItem("darkMode", String(darkMode));
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const filteredTransactions = useMemo(() => {
    const base = !filterMonth
      ? transactions
      : transactions.filter((t) => isInMonth(t.date, filterMonth));

    return [...base].sort((a, b) => {
      const aTime = new Date(a.date).getTime();
      const bTime = new Date(b.date).getTime();
      return bTime - aTime;
    });
  }, [transactions, filterMonth]);

  const { income, expenses, balance } = useMemo(() => {
    let inc = 0;
    let exp = 0;

    for (const t of filteredTransactions) {
      if (t.amount >= 0) inc += t.amount;
      else exp += t.amount;
    }

    return {
      income: inc,
      expenses: exp,
      balance: inc + exp,
    };
  }, [filteredTransactions]);

  const addTransaction = ({ text, amount, type, category, date }) => {
    const signedAmount = toSignedAmount(type, amount);

    if (!text?.trim()) {
      notify("Please enter a description.", "error");
      return;
    }

    if (!date) {
      notify("Please select a date.", "error");
      return;
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      notify("Please enter a valid amount.", "error");
      return;
    }

    const tx = {
      id: crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
      text: text.trim(),
      amount: signedAmount,
      category: category?.trim() || "General",
      date,
    };

    setTransactions((prev) => [tx, ...prev]);
    notify(`${type} added successfully.`, "success");
  };

  const deleteTransaction = (id) => {
    const tx = transactions.find((t) => t.id === id);
    const ok = window.confirm(`Delete "${tx?.text || "this transaction"}"?`);
    if (!ok) return;

    setTransactions((prev) => prev.filter((t) => t.id !== id));
    notify("Transaction deleted.", "info");
  };

  return (
    <div className="app-shell">
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
          <button
            className="ghost mobile-full-btn"
            onClick={() => setShowHistory((v) => !v)}
            type="button"
          >
            {showHistory ? "Hide History" : "Show History"}
          </button>
        </div>

        <HistoryPanel
          visible={showHistory}
          transactions={filteredTransactions}
          onDelete={deleteTransaction}
        />

        <BackupControls
          transactions={transactions}
          setTransactions={setTransactions}
          onNotify={notify}
        />
      </div>

      <div
        className={`toast-stack ${toast.show ? "show" : ""}`}
        aria-live="polite"
        aria-atomic="true"
      >
        <div className={`toast toast-${toast.type}`}>
          <span className="toast-dot" />
          <span className="toast-message">{toast.message}</span>
          <button
            className="toast-close"
            onClick={() => setToast((prev) => ({ ...prev, show: false }))}
            aria-label="Close notification"
            type="button"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./App.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

function formatCurrency(v) {
  return "₱" + v.toFixed(2);
}

function formatMonthLabel(ym) {
  if (!ym) return "";
  const [year, month] = ym.split("-");
  return new Date(year, month - 1).toLocaleString("default", { month: "long", year: "numeric" });
}

function App() {
  // --- existing state & logic (kept intact) ---
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("transactions");
    return saved ? JSON.parse(saved) : [];
  });

  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("Income");
  const [category, setCategory] = useState("General");
  const [date, setDate] = useState("");
  const [filterMonth, setFilterMonth] = useState(() => {
    return localStorage.getItem("filterMonth") || "";
  });

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("filterMonth", filterMonth);
  }, [filterMonth]);

  const addTransaction = (e) => {
    e.preventDefault();
    if (!text.trim() || !amount || !date) return;

    const signedAmount = type === "Expense" ? -Math.abs(parseFloat(amount)) : Math.abs(parseFloat(amount));

    const newTransaction = {
      id: Date.now(),
      text: text.trim(),
      amount: signedAmount,
      category,
      date, // YYYY-MM-DD
    };

    setTransactions([newTransaction, ...transactions]);
    setText("");
    setAmount("");
    setCategory("General");
    setDate("");
    setType("Income");
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  // Filter transactions by month using Date objects
  const filteredTransactions = filterMonth
    ? transactions.filter((t) => {
        const txDate = new Date(t.date);
        const [year, month] = filterMonth.split("-");
        return (
          txDate.getFullYear() === parseInt(year) &&
          txDate.getMonth() + 1 === parseInt(month)
        );
      })
    : transactions;

  const income = filteredTransactions.filter((t) => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
  const expenses = filteredTransactions.filter((t) => t.amount < 0).reduce((acc, t) => acc + t.amount, 0);
  const balance = income + expenses;

  const barChartData = {
    labels: filteredTransactions.map((t, idx) => `${t.text}`.slice(0, 12) || `T${idx}`),
    datasets: [
      {
        label: "Income",
        data: filteredTransactions.map((t) => (t.amount > 0 ? t.amount : 0)),
        backgroundColor: "#4ade80",
        borderRadius: 4,
      },
      {
        label: "Expenses",
        data: filteredTransactions.map((t) => (t.amount < 0 ? Math.abs(t.amount) : 0)),
        backgroundColor: "#f87171",
        borderRadius: 4,
      },
    ],
  };

  const expenseTx = filteredTransactions.filter((t) => t.amount < 0);
  const categories = [...new Set(expenseTx.map((t) => t.category))];
  const palette = ["#f87171", "#fb923c", "#facc15", "#4ade80", "#60a5fa", "#a78bfa", "#f472b6", "#c084fc"];
  const pieChartData = {
    labels: categories,
    datasets: [
      {
        data: categories.map((cat) =>
          Math.abs(expenseTx.filter((t) => t.category === cat).reduce((acc, t) => acc + t.amount, 0))
        ),
        backgroundColor: categories.map((_, i) => palette[i % palette.length]),
      },
    ],
  };

  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const v = context.raw || 0;
            return `${context.dataset.label ? context.dataset.label + ": " : ""}${formatCurrency(v)}`;
          },
        },
      },
    },
  };
  // --- end existing logic ---

  // ----------------------
  // Dark mode (senior-friendly) UI additions
  // ----------------------
  // keep a large, explicit toggle and persist to localStorage
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("finance_dark_mode");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("finance_dark_mode", JSON.stringify(darkMode));
    // Add class to document root to allow CSS root variable toggles
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  // Chart options adjusted for dark / light mode for better contrast
  const chartOptions = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      legend: {
        ...commonChartOptions.plugins.legend,
        labels: {
          color: darkMode ? "#e6eef8" : "#111827",
          font: { size: 12 },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: darkMode ? "#e6eef8" : "#374151", font: { size: 12 } },
        grid: { color: darkMode ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.04)" },
      },
      y: {
        ticks: { color: darkMode ? "#e6eef8" : "#374151", font: { size: 12 } },
        grid: { color: darkMode ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.04)" },
      },
    },
  };

  return (
    <div className="app-container modern-cards" aria-live="polite">
      <header className="header">
        <div className="header-left">
          <h1 className="brand">💰 Finance Dashboard</h1>
          
        </div>

        <div className="header-right">
          <div className={`header-controls ${filterMonth ? "active" : ""}`}>
            <label className="month-label">Month</label>
            <input
              className="month-input"
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              aria-label="Filter month"
            />
            {filterMonth && (
              <>
                <span className="active-month">{formatMonthLabel(filterMonth)}</span>
                <button
                  className="clear-btn"
                  onClick={() => setFilterMonth("")}
                  title="Clear month filter"
                >
                  Clear
                </button>
              </>
            )}
          </div>

          {/* Senior-friendly Dark Mode toggle */}
          <div className="dark-toggle">
            <label className="dm-label">Dark mode</label>
            <button
              className={`dm-button ${darkMode ? "on" : "off"}`}
              onClick={() => setDarkMode((s) => !s)}
              aria-pressed={darkMode}
              aria-label={`Turn dark mode ${darkMode ? "off" : "on"}`}
            >
              <span className="dm-knob" />
              <span className="dm-text">{darkMode ? "ON" : "OFF"}</span>
            </button>
          </div>
        </div>
      </header>

      <section className="summary-cards">
        <div className="card small-card">
          <div className="card-title">Income</div>
          <div className="card-value income-val">{formatCurrency(income)}</div>
        </div>
        <div className="card small-card">
          <div className="card-title">Expenses</div>
          <div className="card-value expenses-val">{formatCurrency(Math.abs(expenses))}</div>
        </div>
        <div className="card small-card">
          <div className="card-title">Balance</div>
          <div className="card-value balance-val">{formatCurrency(balance)}</div>
        </div>
      </section>

      <section className="dashboard-charts" aria-label="charts">
        <div className="chart-box">
          <div className="chart-header">Overview</div>
          <div className="chart-wrapper">
            {filteredTransactions.length > 0 ? (
              <Bar data={barChartData} options={chartOptions} />
            ) : (
              <div className="no-data">📉 No transactions to show</div>
            )}
          </div>
        </div>

        <div className="chart-box">
          <div className="chart-header">Expenses by Category</div>
          <div className="chart-wrapper">
            {categories.length > 0 ? (
              <Pie data={pieChartData} options={chartOptions} />
            ) : (
              <div className="no-data">💸 No expenses to show</div>
            )}
          </div>
        </div>
      </section>

      <section className="transactions-section">
        <form className="transaction-form" onSubmit={addTransaction}>
          <div className="form-top">
            <h3 className="form-title">Add Transaction</h3>
            <div className="small-hint">Type • Category • Date</div>
          </div>

          <input
            className="input"
            type="text"
            placeholder="Description"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            aria-label="Description"
          />

          <input
            className="input"
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="0"
            step="0.01"
            aria-label="Amount"
          />

          <div className="row-two">
            <select className="select" value={type} onChange={(e) => setType(e.target.value)} aria-label="Type">
              <option>Income</option>
              <option>Expense</option>
            </select>

            <select className="select" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
              <option>General</option>
              <option>Salary</option>
              <option>Food</option>
              <option>Bills</option>
              <option>Shopping</option>
              <option>Entertainment</option>
              <option>Transport</option>
              <option>Health</option>
            </select>
          </div>

          <input
            className="input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            aria-label="Date"
          />

          <div className="form-actions">
            <button className="add-btn" type="submit" aria-label="Add transaction">
              Add
            </button>
            <button
              type="button"
              className="clear-all"
              onClick={() => {
                if (window.confirm("Clear all transactions?")) {
                  setTransactions([]);
                }
              }}
              aria-label="Clear all transactions"
            >
              Clear All
            </button>
          </div>
        </form>

        <div className="transaction-list" aria-live="polite">
          <div className="list-header">
            <h3>History</h3>
            <div className="list-meta">{filteredTransactions.length} items</div>
          </div>

          <ul>
            {filteredTransactions.map((t) => (
              <li key={t.id} className="transaction-row">
                <div className="tx-left">
                  <div className="tx-title">{t.text}</div>
                  <div className="tx-meta">
                    <span className="tx-cat">{t.category}</span>
                    <span className="dot">•</span>
                    <span className="tx-date">{t.date}</span>
                  </div>
                </div>

                <div className="tx-right">
                  <div className={`tx-amount ${t.amount >= 0 ? "pos" : "neg"}`}>
                    {t.amount >= 0 ? "+" : "-"}
                    {formatCurrency(Math.abs(t.amount))}
                  </div>
                  <button className="del-btn" onClick={() => deleteTransaction(t.id)} title="Delete transaction" aria-label={`Delete ${t.text}`}>
                    ✖
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

export default App;

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
  return "$" + v.toFixed(2);
}

function App() {
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("transactions");
    return saved ? JSON.parse(saved) : [];
  });

  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("Income");
  const [category, setCategory] = useState("General");
  const [date, setDate] = useState("");
  const [filterMonth, setFilterMonth] = useState("");

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

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
    // reset small form
    setText("");
    setAmount("");
    setCategory("General");
    setDate("");
    setType("Income");
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  // Filter transactions by month (format YYYY-MM) if set
  const filteredTransactions = filterMonth
    ? transactions.filter((t) => t.date.startsWith(filterMonth))
    : transactions;

  // Summary numbers (from filtered set)
  const income = filteredTransactions.filter((t) => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
  const expenses = filteredTransactions.filter((t) => t.amount < 0).reduce((acc, t) => acc + t.amount, 0);
  const balance = income + expenses;

  // Bar chart (compact)
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

  // Pie chart: expenses by category (filtered)
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

  // Chart options (compact)
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

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <h1>💰 Finance Dashboard</h1>
        <div className="header-controls">
          <label className="month-label">Month</label>
          <input
            className="month-input"
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            aria-label="Filter month"
          />
          {filterMonth && (
            <button className="clear-btn" onClick={() => setFilterMonth("")} title="Clear month filter">
              Clear
            </button>
          )}
        </div>
      </header>

      {/* Summary cards */}
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

      {/* Charts row */}
      <section className="dashboard-charts" aria-label="charts">
        <div className="chart-box">
          <div className="chart-header">Overview</div>
          <div className="chart-wrapper">
            {filteredTransactions.length > 0 ? (
              <Bar data={barChartData} options={commonChartOptions} />
            ) : (
              <div className="no-data">No transactions to show</div>
            )}
          </div>
        </div>

        <div className="chart-box">
          <div className="chart-header">Expenses by Category</div>
          <div className="chart-wrapper">
            {categories.length > 0 ? (
              <Pie data={pieChartData} options={commonChartOptions} />
            ) : (
              <div className="no-data">No expenses to show</div>
            )}
          </div>
        </div>
      </section>

      {/* Transactions row (form + list) */}
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
          />

          <div className="row-two">
            <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
              <option>Income</option>
              <option>Expense</option>
            </select>

            <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
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

          <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />

          <div className="form-actions">
            <button className="add-btn" type="submit">
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
            >
              Clear All
            </button>
          </div>
        </form>

        <div className="transaction-list">
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
                  <button className="del-btn" onClick={() => deleteTransaction(t.id)} title="Delete transaction">
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

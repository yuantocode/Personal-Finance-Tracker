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
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("transactions");
    return saved ? JSON.parse(saved) : [];
  });

  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("Income");
  const [category, setCategory] = useState("General");
  const [date, setDate] = useState("");
  const [filterMonth, setFilterMonth] = useState(() => localStorage.getItem("filterMonth") || "");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
  const [showCharts, setShowCharts] = useState(false);
  const [showHistory, setShowHistory] = useState(true);

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("filterMonth", filterMonth);
  }, [filterMonth]);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const addTransaction = (e) => {
    e.preventDefault();
    if (!text.trim() || !amount || !date) return;

    const signedAmount = type === "Expense" ? -Math.abs(parseFloat(amount)) : Math.abs(parseFloat(amount));

    const newTransaction = {
      id: Date.now(),
      text: text.trim(),
      amount: signedAmount,
      category,
      date,
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

  const filteredTransactions = filterMonth
    ? transactions.filter((t) => {
        const txDate = new Date(t.date);
        const [year, month] = filterMonth.split("-");
        return txDate.getFullYear() === parseInt(year) && txDate.getMonth() + 1 === parseInt(month);
      })
    : transactions;

  const income = filteredTransactions.filter((t) => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
  const expenses = filteredTransactions.filter((t) => t.amount < 0).reduce((acc, t) => acc + t.amount, 0);
  const balance = income + expenses;

  const barChartData = {
    labels: filteredTransactions.map((t, idx) => t.text.slice(0, 12) || `T${idx}`),
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
      legend: { position: "top" },
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
      <header className="header">
        <h1>Finance Dashboard</h1>
        <div className="header-controls">
          <input type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} />
          {filterMonth && <span className="selected-month">{formatMonthLabel(filterMonth)}</span>}

          <label className="switch">
            <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
            <span className="slider round"></span>
          </label>
        </div>
      </header>

      <section className="summary-cards">
        <div className="card income-card">
          <span>Income</span>
          <strong>{formatCurrency(income)}</strong>
        </div>
        <div className="card expenses-card">
          <span>Expenses</span>
          <strong>{formatCurrency(Math.abs(expenses))}</strong>
        </div>
        <div className="card balance-card">
          <span>Balance</span>
          <strong>{formatCurrency(balance)}</strong>
        </div>
      </section>

      <section className="transaction-form">
        <form onSubmit={addTransaction}>
          <input type="text" placeholder="Description" value={text} onChange={(e) => setText(e.target.value)} />
          <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option>Income</option>
            <option>Expense</option>
          </select>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option>General</option>
            <option>Salary</option>
            <option>Food</option>
            <option>Bills</option>
            <option>Shopping</option>
            <option>Entertainment</option>
            <option>Transport</option>
            <option>Health</option>
          </select>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <button type="submit">Add Transaction</button>
        </form>
      </section>

      <div className="toggle-panels">
        <button onClick={() => setShowCharts(!showCharts)}>{showCharts ? "Hide Charts" : "Show Charts"}</button>
        <button onClick={() => setShowHistory(!showHistory)}>{showHistory ? "Hide History" : "Show History"}</button>
      </div>

      <section className={`charts-panel ${showCharts ? "visible" : ""}`}>
        <div className="chart-box">
          <Bar data={barChartData} options={commonChartOptions} />
        </div>
        <div className="chart-box">
          <Pie data={pieChartData} options={commonChartOptions} />
        </div>
      </section>

      <section className={`history-panel ${showHistory ? "visible" : ""}`}>
        <h3>History</h3>
        <ul>
          {filteredTransactions.map((t) => (
            <li key={t.id}>
              <span>{t.text} ({t.category}) — {t.date}</span>
              <strong className={t.amount >= 0 ? "pos" : "neg"}>{formatCurrency(t.amount)}</strong>
              <button onClick={() => deleteTransaction(t.id)}>✖</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default App;

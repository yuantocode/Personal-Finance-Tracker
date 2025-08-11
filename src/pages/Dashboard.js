import React from "react";
import { Bar } from "react-chartjs-2";

export default function Dashboard({ transactions }) {
  const income = transactions.filter((t) => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
  const expenses = transactions.filter((t) => t.amount < 0).reduce((acc, t) => acc + t.amount, 0);
  const balance = income + expenses;

  const chartData = {
    labels: transactions.map((t) => t.text),
    datasets: [
      {
        label: "Income",
        data: transactions.map((t) => (t.amount > 0 ? t.amount : 0)),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
      {
        label: "Expenses",
        data: transactions.map((t) => (t.amount < 0 ? Math.abs(t.amount) : 0)),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
    ],
  };

  return (
    <div className="page-container">
      <div className="summary-cards">
        <div className="card income">Income: ${income.toFixed(2)}</div>
        <div className="card expenses">Expenses: ${Math.abs(expenses).toFixed(2)}</div>
        <div className="card balance">Balance: ${balance.toFixed(2)}</div>
      </div>
      <div className="chart-container">
        <Bar data={chartData} />
      </div>
    </div>
  );
}

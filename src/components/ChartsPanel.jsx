import React, { useMemo } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { formatCurrency } from "../utils/format";
import { dayOfMonth } from "../utils/date";

export default function ChartsPanel({ visible, compact, showBar, showPie, transactions }) {
  const { barData, pieData, barOptions, pieOptions } = useMemo(() => {
    // Aggregate by day (1..31)
    const incomeByDay = new Map();
    const expenseByDay = new Map();

    for (const t of transactions) {
      const day = dayOfMonth(t.date);
      if (t.amount >= 0) {
        incomeByDay.set(day, (incomeByDay.get(day) || 0) + t.amount);
      } else {
        expenseByDay.set(day, (expenseByDay.get(day) || 0) + Math.abs(t.amount));
      }
    }

    const days = Array.from(new Set([...incomeByDay.keys(), ...expenseByDay.keys()])).sort((a, b) => a - b);
    const labels = days.map((d) => String(d).padStart(2, "0"));

    const barData = {
      labels,
      datasets: [
        {
          label: "Income",
          data: days.map((d) => incomeByDay.get(d) || 0),
          backgroundColor: "#4ade80",
          borderRadius: 6,
        },
        {
          label: "Expenses",
          data: days.map((d) => expenseByDay.get(d) || 0),
          backgroundColor: "#f87171",
          borderRadius: 6,
        },
      ],
    };

    // Pie: expenses by category
    const expenses = transactions.filter((t) => t.amount < 0);
    const byCat = new Map();
    for (const t of expenses) {
      byCat.set(t.category, (byCat.get(t.category) || 0) + Math.abs(t.amount));
    }

    const categories = Array.from(byCat.keys()).sort(
      (a, b) => (byCat.get(b) || 0) - (byCat.get(a) || 0)
    );

    const palette = ["#f87171", "#fb923c", "#facc15", "#4ade80", "#60a5fa", "#a78bfa", "#f472b6", "#c084fc"];
    const pieData = {
      labels: categories,
      datasets: [
        {
          data: categories.map((c) => byCat.get(c) || 0),
          backgroundColor: categories.map((_, i) => palette[i % palette.length]),
        },
      ],
    };

    const commonPlugins = {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const v = Number(ctx.raw || 0);
            const label = ctx.dataset?.label ? `${ctx.dataset.label}: ` : "";
            return `${label}${formatCurrency(v)}`;
          },
        },
      },
    };

    const barOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: commonPlugins,
      scales: {
        x: { ticks: { maxRotation: 0, autoSkip: true } },
        y: {
          beginAtZero: true,
          ticks: { callback: (v) => formatCurrency(v) },
        },
      },
    };

    const pieOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: commonPlugins,
    };

    return { barData, pieData, barOptions, pieOptions };
  }, [transactions]);

  const hasData = transactions.length > 0;
  const nothingToShow = !showBar && !showPie;

  return (
    <section className={`charts-panel ${visible ? "visible" : ""}`} aria-label="Charts">
      {nothingToShow ? (
        <div className={`chart-box ${compact ? "compact" : ""}`}>
          <div className="panel-title">Charts</div>
          <div className="empty">Charts are hidden. Enable at least one chart above.</div>
        </div>
      ) : (
        <>
          {showBar && (
            <div className={`chart-box ${compact ? "compact" : ""}`}>
              <div className="panel-title">Income vs Expenses by Day</div>
              {hasData ? (
                <Bar data={barData} options={barOptions} />
              ) : (
                <div className="empty">No transactions to chart for this month.</div>
              )}
            </div>
          )}

          {showPie && (
            <div className={`chart-box ${compact ? "compact" : ""}`}>
              <div className="panel-title">Expenses by Category</div>
              {hasData ? (
                <Pie data={pieData} options={pieOptions} />
              ) : (
                <div className="empty">Add expenses to see category breakdown.</div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
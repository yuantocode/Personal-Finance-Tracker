import React from "react";

function formatCurrency(value) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

export default function SummaryCards({ income, expensesAbs, balance }) {
  return (
    <section className="summary-strip">
      <div className="summary-strip-header">
        <div>
          <h2 className="summary-title">Overview</h2>
          <p className="summary-subtitle">Your current totals at a glance</p>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-stat income-stat">
          <span className="summary-label">Income</span>
          <strong>{formatCurrency(income)}</strong>
        </div>

        <div className="summary-divider" />

        <div className="summary-stat expense-stat">
          <span className="summary-label">Expenses</span>
          <strong>{formatCurrency(expensesAbs)}</strong>
        </div>

        <div className="summary-divider" />

        <div className="summary-stat balance-stat">
          <span className="summary-label">Balance</span>
          <strong>{formatCurrency(balance)}</strong>
        </div>
      </div>
    </section>
  );
}
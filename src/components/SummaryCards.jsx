import React from "react";
import { formatCurrency } from "../utils/format";

export default function SummaryCards({ income, expensesAbs, balance }) {
  return (
    <section className="summary-cards" aria-label="Summary">
      <div className="card income-card">
        <span>Income</span>
        <strong>{formatCurrency(income)}</strong>
      </div>
      <div className="card expenses-card">
        <span>Expenses</span>
        <strong>{formatCurrency(expensesAbs)}</strong>
      </div>
      <div className="card balance-card">
        <span>Balance</span>
        <strong>{formatCurrency(balance)}</strong>
      </div>
    </section>
  );
}
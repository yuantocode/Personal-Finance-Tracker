import React, { useMemo, useState } from "react";
import { todayISO } from "../utils/date";

const CATEGORIES = [
  "General",
  "Salary",
  "Food",
  "Bills",
  "Shopping",
  "Entertainment",
  "Transport",
  "Health",
];

export default function TransactionForm({ onAdd }) {
  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("Income");
  const [category, setCategory] = useState("General");
  const [date, setDate] = useState(todayISO());
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => {
    const value = Number(amount);
    return text.trim().length > 0 && Number.isFinite(value) && value > 0 && !!date;
  }, [text, amount, date]);

  const submit = (e) => {
    e.preventDefault();
    setError("");

    const desc = text.trim();
    const value = Number(amount);

    if (!desc) return setError("Please enter a description.");
    if (!date) return setError("Please select a date.");
    if (!Number.isFinite(value) || value <= 0) return setError("Amount must be greater than 0.");

    onAdd({
      text: desc,
      amount: value,
      type,
      category,
      date,
    });

    // Reset (keep date because it’s convenient)
    setText("");
    setAmount("");
    setType("Income");
    setCategory("General");
  };

  return (
    <section className="transaction-form" aria-label="Add transaction">
      <form onSubmit={submit}>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="desc">Description</label>
            <input
              id="desc"
              type="text"
              placeholder="e.g., Groceries, Salary"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="amount">Amount</label>
            <input
              id="amount"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {/* <div className="hint">Enter a positive number. Type controls whether it becomes income/expense.</div> */}
          </div>

          <div className="field">
            <label htmlFor="type">Type</label>
            <select id="type" value={type} onChange={(e) => setType(e.target.value)}>
              <option>Income</option>
              <option>Expense</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="category">Category</label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="field field-actions">
            <button className="primary" type="submit" disabled={!canSubmit}>
              Add Transaction
            </button>
            {error && <div className="error" role="alert">{error}</div>}
          </div>
        </div>
      </form>
    </section>
  );
}
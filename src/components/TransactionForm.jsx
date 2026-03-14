import React, { useMemo, useState } from "react";

function getTodayValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function TransactionForm({ onAdd }) {
  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("Expense");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(getTodayValue());
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);

  const categories = useMemo(
    () => [
      "General",
      "Food",
      "Transport",
      "Bills",
      "Shopping",
      "Health",
      "Entertainment",
      "School",
      "Salary",
      "Allowance",
      "Savings",
      "Other",
    ],
    []
  );

  const resetForm = () => {
    setText("");
    setAmount("");
    setType("Expense");
    setCategory("");
    setDate(getTodayValue());
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!text.trim()) {
      setError("Please enter a description.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    if (!date) {
      setError("Please select a date.");
      return;
    }

    setError("");

    onAdd({
      text: text.trim(),
      amount,
      type,
      category: category.trim() || "General",
      date,
    });

    resetForm();
    setExpanded(false);
  };

  return (
    <section className={`transaction-form compact-form ${expanded ? "open" : ""}`}>
      <div className="compact-form-header">
        <div>
          <h2 className="compact-form-title">Add Transaction</h2>
          <p className="compact-form-subtitle">
            Quickly add income or expenses
          </p>
        </div>

        <button
          type="button"
          className={`compact-toggle-btn ${expanded ? "active" : ""}`}
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
        >
          {expanded ? "Close" : "Open"}
        </button>
      </div>

      <div className={`compact-form-body ${expanded ? "visible" : ""}`}>
        <form onSubmit={handleSubmit}>
          <div className="form-grid compact-grid">
            <div className="field field-wide">
              <label htmlFor="text">Description</label>
              <input
                id="text"
                type="text"
                placeholder="e.g. Lunch, fare, salary"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="amount">Amount</label>
              <input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="type">Type</label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="Expense">Expense</option>
                <option value="Income">Income</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="category">Category</label>
              <input
                id="category"
                list="category-options"
                type="text"
                placeholder="General"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              <datalist id="category-options">
                {categories.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
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

            <div className="field-actions compact-actions">
              <button type="submit" className="primary">
                Save Transaction
              </button>
            </div>
          </div>

          {error ? <p className="error">{error}</p> : null}
        </form>
      </div>
    </section>
  );
}
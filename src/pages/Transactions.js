import React, { useState } from "react";

export default function Transactions({ transactions, addTransaction, deleteTransaction }) {
  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("General");
  const [date, setDate] = useState("");
  const [type, setType] = useState("Income");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text || !amount || !date) return;

    const signedAmount = type === "Expense" ? -Math.abs(parseFloat(amount)) : Math.abs(parseFloat(amount));

    addTransaction({
      id: Date.now(),
      text,
      amount: signedAmount,
      category,
      date,
    });

    setText("");
    setAmount("");
    setCategory("General");
    setDate("");
    setType("Income");
  };

  return (
    <div className="page-container">
      <form className="transaction-form" onSubmit={handleSubmit}>
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
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <button type="submit">Add</button>
      </form>

      <ul className="transaction-list">
        {transactions.map((t) => (
          <li key={t.id} className={t.amount >= 0 ? "income-item" : "expense-item"}>
            <div>
              <strong>{t.text}</strong> ({t.category})<br />
              <small>{t.date}</small>
            </div>
            <div>
              {t.amount >= 0 ? "+" : "-"}${Math.abs(t.amount).toFixed(2)}
              <button onClick={() => deleteTransaction(t.id)}>X</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

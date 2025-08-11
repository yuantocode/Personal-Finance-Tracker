import React, { useState } from "react";

function App() {
  const [transactions, setTransactions] = useState([]);
  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");

  const addTransaction = (e) => {
    e.preventDefault();
    if (!text || !amount) return;

    const newTransaction = {
      id: Date.now(),
      text,
      amount: parseFloat(amount),
    };

    setTransactions([newTransaction, ...transactions]);
    setText("");
    setAmount("");
  };

  const totalBalance = transactions.reduce((acc, t) => acc + t.amount, 0);

  return (
    <div style={{
      maxWidth: "500px",
      margin: "20px auto",
      padding: "20px",
      border: "1px solid #ccc",
      borderRadius: "10px",
      fontFamily: "Arial, sans-serif"
    }}>
      <h1 style={{ textAlign: "center" }}>💰 Personal Finance Tracker</h1>

      <h2 style={{
        textAlign: "center",
        color: totalBalance >= 0 ? "green" : "red"
      }}>
        Balance: ${totalBalance.toFixed(2)}
      </h2>

      <form onSubmit={addTransaction} style={{ marginTop: "20px" }}>
        <input
          type="text"
          placeholder="Description"
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc"
          }}
        />
        <input
          type="number"
          placeholder="Amount (+ for income, - for expense)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc"
          }}
        />
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Add Transaction
        </button>
      </form>

      <h3 style={{ marginTop: "20px" }}>History</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {transactions.length === 0 && <p>No transactions yet</p>}
        {transactions.map((t) => (
          <li
            key={t.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px",
              borderLeft: `4px solid ${t.amount >= 0 ? "green" : "red"}`,
              marginBottom: "5px",
              backgroundColor: "#f9f9f9",
              borderRadius: "5px"
            }}
          >
            <span>{t.text}</span>
            <span>{t.amount >= 0 ? "+" : ""}${t.amount.toFixed(2)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;

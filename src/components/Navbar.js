import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <h1>💰 Finance Tracker</h1>
      <div>
        <Link to="/">Dashboard</Link>
        <Link to="/transactions">Transactions</Link>
      </div>
    </nav>
  );
}

import React from "react";
import { formatMonthLabel } from "../utils/date";

export default function Header({
  filterMonth,
  setFilterMonth,
  darkMode,
  setDarkMode,
}) {
  return (
    <header className="header">
      <div className="header-title">
        <h1>Finance Dashboard</h1>
        <p className="subtitle">Track income, expenses, and trends for the month.</p>
      </div>

      <div className="header-controls">
        <div className="control">
          <label className="control-label" htmlFor="monthFilter">Month</label>
          <input
            id="monthFilter"
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          />
          {filterMonth && (
            <span className="selected-month">{formatMonthLabel(filterMonth)}</span>
          )}
        </div>

        <div className="control">
          <span className="control-label">Theme</span>
          <label className="switch" aria-label="Toggle dark mode">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => setDarkMode((v) => !v)}
            />
            <span className="slider round"></span>
          </label>
        </div>
      </div>
    </header>
  );
}
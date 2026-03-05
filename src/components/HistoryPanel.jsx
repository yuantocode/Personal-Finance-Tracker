import React, { useMemo, useState, useEffect } from "react";
import { formatCurrency } from "../utils/format";
import { todayISO } from "../utils/date";

function typeOf(amount) {
  return amount >= 0 ? "Income" : "Expense";
}

function addDaysISO(isoDate, deltaDays) {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + deltaDays);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function HistoryPanel({ visible, transactions, onDelete }) {
  // Day view
  const [dayMode, setDayMode] = useState("today"); // today | yesterday | pick
  const [pickedDate, setPickedDate] = useState(todayISO());

  // Filters
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sort, setSort] = useState("dateDesc");

  // Pagination
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const activeDate = useMemo(() => {
    const t = todayISO();
    if (dayMode === "today") return t;
    if (dayMode === "yesterday") return addDaysISO(t, -1);
    return pickedDate || t;
  }, [dayMode, pickedDate]);

  const categories = useMemo(() => {
    const set = new Set(transactions.map((t) => t.category));
    return ["All", ...Array.from(set).sort()];
  }, [transactions]);

  // Reset to page 1 when filters/date change
  useEffect(() => {
    setPage(1);
  }, [activeDate, query, typeFilter, categoryFilter, sort, pageSize]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = transactions.filter((t) => {
      // Only show selected date (day view)
      if ((t.date || "") !== activeDate) return false;

      if (typeFilter !== "All" && typeOf(t.amount) !== typeFilter) return false;
      if (categoryFilter !== "All" && t.category !== categoryFilter) return false;

      if (!q) return true;
      const hay = `${t.text} ${t.category} ${t.date}`.toLowerCase();
      return hay.includes(q);
    });

    list = [...list].sort((a, b) => {
      if (sort === "dateDesc") return (b.date || "").localeCompare(a.date || "");
      if (sort === "dateAsc") return (a.date || "").localeCompare(b.date || "");
      if (sort === "amountDesc") return Math.abs(b.amount) - Math.abs(a.amount);
      if (sort === "amountAsc") return Math.abs(a.amount) - Math.abs(b.amount);
      return 0;
    });

    return list;
  }, [transactions, activeDate, query, typeFilter, categoryFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const pageRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, safePage, pageSize]);

  const hasRows = filteredRows.length > 0;

  return (
    <section className={`history-panel ${visible ? "visible" : ""}`} aria-label="History sheet">
      <div className="history-header">
        <div>
          <h3>History</h3>
          <div className="muted">
            Showing <b>{activeDate}</b> — {filteredRows.length} item(s)
          </div>
        </div>
      </div>

      {/* Day selector */}
      <div className="day-controls" aria-label="Day controls">
        <button
          className={dayMode === "today" ? "chip active" : "chip"}
          onClick={() => setDayMode("today")}
          type="button"
        >
          Today
        </button>
        <button
          className={dayMode === "yesterday" ? "chip active" : "chip"}
          onClick={() => setDayMode("yesterday")}
          type="button"
        >
          Yesterday
        </button>
        <button
          className={dayMode === "pick" ? "chip active" : "chip"}
          onClick={() => setDayMode("pick")}
          type="button"
        >
          Pick date
        </button>

        {dayMode === "pick" && (
          <input
            type="date"
            value={pickedDate}
            onChange={(e) => setPickedDate(e.target.value)}
            aria-label="Pick a date"
          />
        )}
      </div>

      {/* Filters */}
      <div className="sheet-controls">
        <div className="control-inline">
          <label className="muted" htmlFor="search">Search</label>
          <input
            id="search"
            type="text"
            placeholder="Search description, category…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="control-inline">
          <label className="muted" htmlFor="typeFilter">Type</label>
          <select id="typeFilter" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option>All</option>
            <option>Income</option>
            <option>Expense</option>
          </select>
        </div>

        <div className="control-inline">
          <label className="muted" htmlFor="catFilter">Category</label>
          <select id="catFilter" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div className="control-inline">
          <label className="muted" htmlFor="sort">Sort</label>
          <select id="sort" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="dateDesc">Date (new → old)</option>
            <option value="dateAsc">Date (old → new)</option>
            <option value="amountDesc">Amount (high → low)</option>
            <option value="amountAsc">Amount (low → high)</option>
          </select>
        </div>
      </div>

      {/* Pagination controls (no long scrolling) */}
      <div className="pager" aria-label="Pagination controls">
        <div className="pager-left">
          <span className="muted">Rows per page</span>
          <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="pager-right">
          <button className="ghost" onClick={() => setPage(1)} disabled={safePage === 1}>
            ⏮
          </button>
          <button className="ghost" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}>
            Prev
          </button>

          <span className="muted">
            Page <b>{safePage}</b> of <b>{totalPages}</b>
          </span>

          <button
            className="ghost"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
          >
            Next
          </button>
          <button className="ghost" onClick={() => setPage(totalPages)} disabled={safePage === totalPages}>
            ⏭
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="sheet-wrap" role="region" aria-label="Transactions table">
        {!hasRows ? (
          <div className="empty">No transactions for this day.</div>
        ) : (
          <table className="sheet">
            <thead>
              <tr>
                <th className="col-time">Date</th>
                <th className="col-desc">Description</th>
                <th className="col-cat">Category</th>
                <th className="col-type">Type</th>
                <th className="col-amt">Amount</th>
                <th className="col-act"> </th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((t) => {
                const ttype = typeOf(t.amount);
                const amtClass = t.amount >= 0 ? "pos" : "neg";
                return (
                  <tr key={t.id}>
                    <td className="col-time">{t.date}</td>
                    <td className="col-desc" title={t.text}>{t.text}</td>
                    <td className="col-cat"><span className="pill">{t.category}</span></td>
                    <td className="col-type">{ttype}</td>
                    <td className={`col-amt ${amtClass}`}>{formatCurrency(t.amount)}</td>
                    <td className="col-act">
                      <button
                        className="icon-btn"
                        aria-label={`Delete ${t.text}`}
                        title="Delete"
                        onClick={() => onDelete(t.id)}
                      >
                        ✖
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
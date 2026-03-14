import React, { useEffect, useMemo, useState } from "react";

function formatCurrency(value) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value) {
  if (!value) return "No date";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function isToday(dateString) {
  const d = new Date(dateString);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isYesterday(dateString) {
  const d = new Date(dateString);
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return (
    d.getFullYear() === y.getFullYear() &&
    d.getMonth() === y.getMonth() &&
    d.getDate() === y.getDate()
  );
}

export default function HistoryPanel({ visible, transactions, onDelete }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [dayFilter, setDayFilter] = useState("all");
  const [page, setPage] = useState(1);

  const itemsPerPageDesktop = 10;
  const itemsPerPageMobile = 6;

  const categories = useMemo(() => {
    const values = Array.from(
      new Set(
        transactions
          .map((t) => (t.category || "General").trim())
          .filter(Boolean)
      )
    );
    return values.sort((a, b) => a.localeCompare(b));
  }, [transactions]);

  const filteredList = useMemo(() => {
    let list = [...transactions];
    const q = search.trim().toLowerCase();

    if (q) {
      list = list.filter((t) => {
        const text = (t.text || "").toLowerCase();
        const category = (t.category || "").toLowerCase();
        const amount = String(t.amount ?? "");
        const date = String(t.date ?? "").toLowerCase();

        return (
          text.includes(q) ||
          category.includes(q) ||
          amount.includes(q) ||
          date.includes(q)
        );
      });
    }

    if (typeFilter !== "All") {
      list = list.filter((t) =>
        typeFilter === "Income" ? t.amount >= 0 : t.amount < 0
      );
    }

    if (categoryFilter !== "All") {
      list = list.filter((t) => (t.category || "General") === categoryFilter);
    }

    if (dayFilter === "today") {
      list = list.filter((t) => isToday(t.date));
    } else if (dayFilter === "yesterday") {
      list = list.filter((t) => isYesterday(t.date));
    }

    switch (sortBy) {
      case "oldest":
        list.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case "amount-high":
        list.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
        break;
      case "amount-low":
        list.sort((a, b) => Math.abs(a.amount) - Math.abs(b.amount));
        break;
      case "newest":
      default:
        list.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
    }

    return list;
  }, [transactions, search, typeFilter, categoryFilter, sortBy, dayFilter]);

  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 640);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const itemsPerPage = isMobile ? itemsPerPageMobile : itemsPerPageDesktop;
  const totalPages = Math.max(1, Math.ceil(filteredList.length / itemsPerPage));

  useEffect(() => {
    setPage(1);
  }, [search, typeFilter, categoryFilter, sortBy, dayFilter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pagedTransactions = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, page, itemsPerPage]);

  const startItem =
    filteredList.length === 0 ? 0 : (page - 1) * itemsPerPage + 1;
  const endItem = Math.min(page * itemsPerPage, filteredList.length);

  return (
    <section className={`history-panel ${visible ? "visible" : ""}`}>
      <div className="history-header">
        <div>
          <h2 className="panel-title">Transaction History</h2>
          <p className="panel-subtitle">
            Showing {startItem}-{endItem} of {filteredList.length}
          </p>
        </div>
      </div>

      <div className="day-controls">
        <button
          type="button"
          className={`chip ${dayFilter === "all" ? "active" : ""}`}
          onClick={() => setDayFilter("all")}
        >
          All
        </button>
        <button
          type="button"
          className={`chip ${dayFilter === "today" ? "active" : ""}`}
          onClick={() => setDayFilter("today")}
        >
          Today
        </button>
        <button
          type="button"
          className={`chip ${dayFilter === "yesterday" ? "active" : ""}`}
          onClick={() => setDayFilter("yesterday")}
        >
          Yesterday
        </button>
      </div>

      <div className="sheet-controls">
        <div className="control-inline">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            type="text"
            placeholder="Search description, category, date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="control-inline">
          <label htmlFor="typeFilter">Type</label>
          <select
            id="typeFilter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>
        </div>

        <div className="control-inline">
          <label htmlFor="categoryFilter">Category</label>
          <select
            id="categoryFilter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="control-inline">
          <label htmlFor="sortBy">Sort</label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="amount-high">Highest amount</option>
            <option value="amount-low">Lowest amount</option>
          </select>
        </div>
      </div>

      {!pagedTransactions.length ? (
        <div className="empty-state">
          <div className="empty-icon">🧾</div>
          <div className="empty-title">No transactions found</div>
          <div className="empty-text">
            Try changing your filters or add a new transaction.
          </div>
        </div>
      ) : (
        <>
          <div className="desktop-history">
            <div className="sheet-wrap">
              <table className="sheet">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th className="col-amt">Amount</th>
                    <th className="col-act">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedTransactions.map((t) => (
                    <tr key={t.id}>
                      <td>{formatDate(t.date)}</td>
                      <td className="col-desc" title={t.text}>
                        {t.text}
                      </td>
                      <td>
                        <span className="pill">{t.category || "General"}</span>
                      </td>
                      <td className={`col-amt ${t.amount >= 0 ? "pos" : "neg"}`}>
                        {t.amount >= 0 ? "+" : "-"}
                        {formatCurrency(Math.abs(t.amount))}
                      </td>
                      <td className="col-act">
                        <button
                          className="icon-btn delete-btn"
                          onClick={() => onDelete(t.id)}
                          aria-label={`Delete ${t.text}`}
                          type="button"
                          title="Delete transaction"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mobile-history-cards">
            {pagedTransactions.map((t) => (
              <article key={t.id} className="tx-card">
                <div className="tx-card-top">
                  <div className="tx-main">
                    <h3 className="tx-title">{t.text}</h3>
                    <p className="tx-date">{formatDate(t.date)}</p>
                  </div>

                  <div className={`tx-amount ${t.amount >= 0 ? "pos" : "neg"}`}>
                    {t.amount >= 0 ? "+" : "-"}
                    {formatCurrency(Math.abs(t.amount))}
                  </div>
                </div>

                <div className="tx-meta">
                  <span className="pill">{t.category || "General"}</span>
                  <span
                    className={`type-pill ${
                      t.amount >= 0 ? "income" : "expense"
                    }`}
                  >
                    {t.amount >= 0 ? "Income" : "Expense"}
                  </span>
                </div>

                <div className="tx-actions">
                  <button
                    className="delete-mobile-btn"
                    onClick={() => onDelete(t.id)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="pager">
            <div className="pager-left">
              <span className="pager-text">
                Page {page} of {totalPages}
              </span>
            </div>

            <div className="pager-right">
              <button
                type="button"
                className="ghost"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>

              <button
                type="button"
                className="primary"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
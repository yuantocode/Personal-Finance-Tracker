import React, { useEffect, useMemo, useState } from "react";

function getTodayValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Bills",
  "Shopping",
  "Health",
  "Entertainment",
  "School",
  "Other",
];

const INCOME_CATEGORIES = [
  "Salary",
  "Allowance",
  "Savings",
  "Gift",
  "Bonus",
  "Other",
];

function loadSavedCustomCategories() {
  try {
    const raw = localStorage.getItem("customCategories");
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCustomCategories(categories) {
  try {
    localStorage.setItem("customCategories", JSON.stringify(categories));
  } catch {
    // ignore storage errors
  }
}

export default function TransactionForm({ onAdd }) {
  const [showFormModal, setShowFormModal] = useState(false);

  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("Expense");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(getTodayValue());
  const [error, setError] = useState("");

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  const [selectedCustomCategory, setSelectedCustomCategory] = useState("");
  const [savedCustomCategories, setSavedCustomCategories] = useState(() =>
    loadSavedCustomCategories()
  );

  const categoryOptions = useMemo(() => {
    return type === "Income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  }, [type]);

  useEffect(() => {
    if (!categoryOptions.includes(category)) {
      setCategory(categoryOptions[0]);
    }
  }, [categoryOptions, category]);

  const resetForm = (nextType = type) => {
    const nextOptions =
      nextType === "Income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    setText("");
    setAmount("");
    setType(nextType);
    setCategory(nextOptions[0]);
    setDate(getTodayValue());
    setError("");
    setCustomCategoryInput("");
    setSelectedCustomCategory("");
    setShowCategoryModal(false);
  };

  const handleOpenForm = () => {
    setShowFormModal(true);
  };

  const handleCloseForm = () => {
    setShowFormModal(false);
    setError("");
    setShowCategoryModal(false);
  };

  const handleTypeChange = (e) => {
    const nextType = e.target.value;
    const nextOptions =
      nextType === "Income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    setType(nextType);
    setCategory(nextOptions[0]);
    setCustomCategoryInput("");
    setSelectedCustomCategory("");
    setShowCategoryModal(false);
  };

  const handleCategoryChange = (e) => {
    const nextCategory = e.target.value;

    setCategory(nextCategory);
    setCustomCategoryInput("");
    setSelectedCustomCategory("");

    if (nextCategory === "Other") {
      setShowCategoryModal(true);
    } else {
      setShowCategoryModal(false);
    }
  };

  const handleUseSavedCategory = (value) => {
    setSelectedCustomCategory(value);
    setCustomCategoryInput("");
  };

  const handleSaveCustomCategoryChoice = () => {
    const finalCustom =
      customCategoryInput.trim() || selectedCustomCategory.trim();

    if (!finalCustom) {
      setError("Please type or select a custom category.");
      return;
    }

    const normalized = finalCustom.trim();

    const nextSaved = Array.from(
      new Set([normalized, ...savedCustomCategories.map((item) => item.trim())])
    ).sort((a, b) => a.localeCompare(b));

    setSavedCustomCategories(nextSaved);
    saveCustomCategories(nextSaved);

    setSelectedCustomCategory(normalized);
    setCustomCategoryInput("");
    setShowCategoryModal(false);
    setError("");
  };

  const handleCloseCategoryModal = () => {
    if (!selectedCustomCategory.trim()) {
      setCategory(categoryOptions[0]);
    }
    setCustomCategoryInput("");
    setShowCategoryModal(false);
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

    let finalCategory = category;

    if (category === "Other") {
      finalCategory = selectedCustomCategory.trim();
      if (!finalCategory) {
        setError("Please choose or create a custom category first.");
        setShowCategoryModal(true);
        return;
      }
    }

    setError("");

    onAdd({
      text: text.trim(),
      amount,
      type,
      category: finalCategory,
      date,
    });

    resetForm(type);
    setShowFormModal(false);
  };

  return (
    <>
      <section className="transaction-launcher-card">
        <div className="transaction-launcher-content">
          <div>
            <div className="transaction-launcher-kicker">Quick entry</div>
            <h2 className="transaction-launcher-title">Add Transaction</h2>
            <p className="transaction-launcher-subtitle">
              Open a clean popup form when you want to add income or expenses.
            </p>
          </div>

          <button
            type="button"
            className="primary transaction-launcher-btn"
            onClick={handleOpenForm}
          >
            Add Transaction
          </button>
        </div>
      </section>

      {showFormModal && (
        <div className="modal-backdrop" onClick={handleCloseForm}>
          <div
            className="entry-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="entry-modal-title"
          >
            <div className="entry-modal-header">
              <div>
                <div className="entry-modal-kicker">Quick entry</div>
                <h3 id="entry-modal-title" className="entry-modal-title">
                  Add Transaction
                </h3>
                <p className="entry-modal-subtitle">
                  Fill in the details below and save it to your history.
                </p>
              </div>

              <button
                type="button"
                className="icon-btn"
                onClick={handleCloseForm}
                aria-label="Close add transaction modal"
              >
                ✕
              </button>
            </div>

            <div className="entry-modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-grid modal-form-grid">
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
                    <select id="type" value={type} onChange={handleTypeChange}>
                      <option value="Expense">Expense</option>
                      <option value="Income">Income</option>
                    </select>
                  </div>

                  <div className="field">
                    <label htmlFor="category">Category</label>
                    <select
                      id="category"
                      value={category}
                      onChange={handleCategoryChange}
                    >
                      {categoryOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
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

                  <div className="field-actions modal-form-actions">
                    <button type="submit" className="primary">
                      Save Transaction
                    </button>
                  </div>
                </div>

                {category === "Other" && selectedCustomCategory ? (
                  <p className="selected-custom-category">
                    Custom category: <strong>{selectedCustomCategory}</strong>
                  </p>
                ) : null}

                {error ? <p className="error">{error}</p> : null}
              </form>
            </div>
          </div>
        </div>
      )}

      {showCategoryModal && (
        <div
          className="modal-backdrop modal-layer-top"
          onClick={handleCloseCategoryModal}
        >
          <div
            className="category-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-modal-title"
          >
            <div className="category-modal-header">
              <div>
                <h3 id="category-modal-title" className="category-modal-title">
                  Custom Category
                </h3>
                <p className="category-modal-subtitle">
                  Type a new category or choose one you already saved.
                </p>
              </div>

              <button
                type="button"
                className="icon-btn"
                onClick={handleCloseCategoryModal}
                aria-label="Close custom category modal"
              >
                ✕
              </button>
            </div>

            <div className="category-modal-body">
              <div className="field">
                <label htmlFor="customCategoryInput">New category</label>
                <input
                  id="customCategoryInput"
                  type="text"
                  placeholder="e.g. Pet care, Freelance, Side hustle"
                  value={customCategoryInput}
                  onChange={(e) => {
                    setCustomCategoryInput(e.target.value);
                    setSelectedCustomCategory("");
                  }}
                />
              </div>

              {savedCustomCategories.length > 0 && (
                <div className="saved-category-block">
                  <p className="saved-category-title">Saved custom categories</p>

                  <div className="saved-category-list">
                    {savedCustomCategories.map((item) => (
                      <button
                        key={item}
                        type="button"
                        className={`saved-category-chip ${
                          selectedCustomCategory === item ? "active" : ""
                        }`}
                        onClick={() => handleUseSavedCategory(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="category-modal-actions">
              <button
                type="button"
                className="ghost"
                onClick={handleCloseCategoryModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="primary"
                onClick={handleSaveCustomCategoryChoice}
              >
                Use Category
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
import React, { useRef, useState } from "react";

function downloadJSON(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

// Very light validation to avoid crashing on bad files
function normalizeTransactions(input) {
  if (!Array.isArray(input)) return null;

  const cleaned = input
    .filter((t) => t && typeof t === "object")
    .map((t) => ({
      id: t.id ?? `${Date.now()}-${Math.random()}`,
      text: String(t.text ?? "").trim(),
      amount: Number(t.amount ?? 0),
      category: String(t.category ?? "General"),
      date: String(t.date ?? ""),
    }))
    .filter((t) => t.text && Number.isFinite(t.amount) && t.date);

  return cleaned;
}

export default function BackupControls({ transactions, setTransactions }) {
  const fileRef = useRef(null);
  const [merge, setMerge] = useState(false);

  const onExport = () => {
    downloadJSON("finance-backup.json", transactions);
  };

  const onPickFile = () => {
    fileRef.current?.click();
  };

  const onImportFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow importing same file again
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const imported = normalizeTransactions(parsed);

      if (!imported) {
        alert("Invalid backup file. Please choose a valid finance-backup.json.");
        return;
      }

      if (!merge) {
        const ok = window.confirm("Replace ALL current transactions with this backup?");
        if (!ok) return;
        setTransactions(imported);
        return;
      }

      // Merge mode: dedupe by id
      setTransactions((prev) => {
        const map = new Map(prev.map((t) => [t.id, t]));
        for (const t of imported) map.set(t.id, t);
        // newest first if your UI expects that
        return Array.from(map.values()).sort((a, b) => String(b.date).localeCompare(String(a.date)));
      });
    } catch {
      alert("Could not read that file. Make sure it's valid JSON.");
    }
  };

  return (
    <div className="backup-bar" aria-label="Backup controls">
      <div className="backup-left">
        <button className="ghost" type="button" onClick={onExport}>
          Export Backup
        </button>

        <button className="ghost" type="button" onClick={onPickFile}>
          Import Backup
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          style={{ display: "none" }}
          onChange={onImportFile}
        />
      </div>

      <label className="check">
        <input
          type="checkbox"
          checked={merge}
          onChange={(e) => setMerge(e.target.checked)}
        />
        Merge (don’t overwrite)
      </label>
    </div>
  );
}
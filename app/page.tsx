 "use client";

import { useEffect, useState, useCallback, useMemo } from "react";

type StoredNote = {
  id: string;
  title: string;
  body: string;
  updatedAt: number;
};

const STORAGE_KEY = "agentic-note";

const formatDate = (timestamp: number) =>
  new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(timestamp));

export default function Page() {
  const [note, setNote] = useState<StoredNote>(() => ({
    id: crypto.randomUUID(),
    title: "",
    body: "",
    updatedAt: Date.now()
  }));
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    const savedRaw = window.localStorage.getItem(STORAGE_KEY);
    if (savedRaw) {
      try {
        const parsed = JSON.parse(savedRaw) as StoredNote;
        setNote({
          ...parsed,
          id: parsed.id || crypto.randomUUID()
        });
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const persist = useCallback((next: StoredNote) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSavedMessage(`Saved at ${formatDate(next.updatedAt)}`);
    setTimeout(() => setSavedMessage(""), 2500);
  }, []);

  const updateNote = useCallback(
    (updates: Partial<StoredNote>) => {
      const next = {
        ...note,
        ...updates,
        updatedAt: Date.now()
      };
      setNote(next);
      persist(next);
    },
    [note, persist]
  );

  const wordCount = useMemo(() => {
    if (!note.body.trim()) return 0;
    return note.body.trim().split(/\s+/).length;
  }, [note.body]);

  const charCount = note.body.length;

  const handleClear = () => {
    const reset = {
      id: crypto.randomUUID(),
      title: "",
      body: "",
      updatedAt: Date.now()
    };
    setNote(reset);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reset));
    setSavedMessage("Cleared note");
    setTimeout(() => setSavedMessage(""), 2000);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(
      `${note.title ? `${note.title}\n\n` : ""}${note.body}`
    );
    setSavedMessage("Copied to clipboard");
    setTimeout(() => setSavedMessage(""), 2000);
  };

  return (
    <div className="note-shell">
      <header>
        <h1>Quick Note</h1>
        <p>Capture a single note and keep it safe locally in your browser.</p>
        <div className="status">
          <span>{savedMessage}</span>
          <span>Words: {wordCount}</span>
          <span>Characters: {charCount}</span>
          <span>Updated: {formatDate(note.updatedAt)}</span>
        </div>
      </header>

      <form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <label htmlFor="title">Title</label>
        <input
          id="title"
          value={note.title}
          onChange={(event) => updateNote({ title: event.target.value })}
          placeholder="Meeting with Luna"
        />

        <label htmlFor="body">Note</label>
        <textarea
          id="body"
          value={note.body}
          onChange={(event) => updateNote({ body: event.target.value })}
          placeholder="Key decisions, ideas, action items..."
          rows={10}
        />
      </form>

      <div className="actions">
        <button type="button" onClick={handleCopy}>
          Copy
        </button>
        <button type="button" onClick={handleClear} className="secondary">
          Clear
        </button>
      </div>
    </div>
  );
}

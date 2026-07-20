"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Check, Disc3, LoaderCircle, LockKeyhole, RefreshCw, Trash2 } from "lucide-react";

export default function AdminQueue() {
  const [password, setPassword] = useState("");
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState("locked");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("dj-admin-password");
    if (saved) { setPassword(saved); load(saved); }
  }, []);

  async function load(pass = password) {
    setStatus("loading");
    setError("");
    const response = await fetch("/api/requests", { headers: { "x-admin-password": pass }, cache: "no-store" });
    const data = await response.json();
    if (!response.ok) { setStatus("locked"); setError(data.error); return; }
    sessionStorage.setItem("dj-admin-password", pass);
    setRequests(data.requests);
    setStatus("ready");
  }

  async function remove(id) {
    const previous = requests;
    setRequests((items) => items.filter((item) => item.id !== id));
    const response = await fetch("/api/requests", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ id }),
    });
    if (!response.ok) setRequests(previous);
  }

  if (status === "locked" || status === "loading") {
    return (
      <main className="admin-page">
        <div className="admin-login">
          <a href="/" className="back-link"><ArrowLeft size={16} /> Back to request page</a>
          <span className="brand-mark admin-mark"><LockKeyhole size={24} /></span>
          <span className="step">DJ ACCESS ONLY</span>
          <h1>Open the queue.</h1>
          <p>Enter your admin password to view tonight’s requests.</p>
          <form onSubmit={(event) => { event.preventDefault(); load(); }}>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Admin password" autoFocus required />
            {error && <span className="form-error">{error}</span>}
            <button className="submit-button" disabled={status === "loading"}>
              <span>{status === "loading" ? "Opening…" : "Open queue"}</span>
              {status === "loading" ? <LoaderCircle className="spin" size={20} /> : <LockKeyhole size={19} />}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="queue-page">
      <header className="queue-header shell">
        <a className="brand" href="/"><span className="brand-mark"><Disc3 size={18} /></span><span>DJ SCORPION</span></a>
        <button className="refresh-button" onClick={() => load()}><RefreshCw size={16} /> Refresh</button>
      </header>
      <section className="queue-content shell">
        <div className="queue-title"><div><span className="step">LIVE REQUESTS</span><h1>Tonight’s queue</h1></div><span className="count">{requests.length}</span></div>
        {requests.length === 0 ? (
          <div className="empty-state"><Disc3 size={38} /><h2>No requests yet</h2><p>Share the request page and watch this space.</p></div>
        ) : (
          <div className="request-list">
            {requests.map((item, index) => (
              <article className="queue-item" key={item.id}>
                <span className="queue-number">{String(requests.length - index).padStart(2, "0")}</span>
                <div className="song-info"><h2>{item.title}</h2><p>{item.artist || "Artist not given"}</p>{item.note && <blockquote>“{item.note}”</blockquote>}</div>
                <div className="requester"><span>REQUESTED BY</span><strong>{item.name}</strong><time>{new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time></div>
                <button className="played-button" onClick={() => remove(item.id)} title="Mark as played"><Check size={18} /><span>Played</span></button>
                <button className="delete-button" onClick={() => remove(item.id)} title="Remove request"><Trash2 size={16} /></button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

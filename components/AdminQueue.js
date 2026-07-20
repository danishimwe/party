"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Disc3, History, LoaderCircle, LockKeyhole, Play, Radio, RefreshCw, Square, Trash2 } from "lucide-react";

export default function AdminQueue() {
  const [password, setPassword] = useState("");
  const [requests, setRequests] = useState([]);
  const [nowPlaying, setNowPlaying] = useState(null);
  const [played, setPlayed] = useState([]);
  const [status, setStatus] = useState("locked");
  const [actionStatus, setActionStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("dj-admin-password");
    if (saved) {
      setPassword(saved);
      load(saved);
    }
  }, []);

  async function load(pass = password, quiet = false) {
    if (!quiet) setStatus("loading");
    setError("");
    const response = await fetch("/api/requests", {
      headers: { "x-admin-password": pass },
      cache: "no-store",
    });
    const data = await response.json();
    if (!response.ok) {
      setStatus("locked");
      setError(data.error);
      return;
    }
    sessionStorage.setItem("dj-admin-password", pass);
    setRequests(data.requests || []);
    setNowPlaying(data.nowPlaying || null);
    setPlayed(data.played || []);
    setStatus("ready");
  }

  async function control(action) {
    setActionStatus(action);
    setError("");
    const response = await fetch("/api/requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ action }),
    });
    const data = await response.json();
    if (!response.ok) setError(data.error);
    await load(password, true);
    setActionStatus("");
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
          <p>Enter your admin password to control tonight’s requests.</p>
          <form onSubmit={(event) => { event.preventDefault(); load(); }}>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Admin password" autoFocus required />
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
        <button className="refresh-button" onClick={() => load(password, true)}><RefreshCw size={16} /> Refresh</button>
      </header>

      <section className="queue-content shell">
        <div className="queue-title">
          <div><span className="step">DJ CONTROL ROOM</span><h1>Tonight’s queue</h1></div>
          <span className="count">{requests.length}</span>
        </div>

        <div className={`admin-now-playing${nowPlaying ? " active" : ""}`}>
          <div className="admin-now-copy">
            <span className="admin-live-label"><Radio size={14} /> {nowPlaying ? "ON AIR" : "PLAYER READY"}</span>
            <h2>{nowPlaying ? nowPlaying.title : "Nothing playing"}</h2>
            <p>{nowPlaying ? `${nowPlaying.artist || "Artist not given"} · requested by ${nowPlaying.name}` : "Press play to take request #1 from the queue."}</p>
          </div>
          {nowPlaying ? (
            <button className="stop-button" onClick={() => control("stop")} disabled={Boolean(actionStatus)}>
              {actionStatus === "stop" ? <LoaderCircle className="spin" size={20} /> : <Square size={18} fill="currentColor" />}
              Stop &amp; archive
            </button>
          ) : (
            <button className="play-button" onClick={() => control("play")} disabled={Boolean(actionStatus) || requests.length === 0}>
              {actionStatus === "play" ? <LoaderCircle className="spin" size={20} /> : <Play size={19} fill="currentColor" />}
              Play next
            </button>
          )}
        </div>

        {error && <p className="admin-action-error">{error}</p>}

        <div className="admin-section-heading"><span>WAITING</span><small>Oldest request plays first</small></div>
        {requests.length === 0 ? (
          <div className="empty-state"><Disc3 size={38} /><h2>No requests waiting</h2><p>Share the request page and watch this space.</p></div>
        ) : (
          <div className="request-list">
            {requests.map((item, index) => (
              <article className="queue-item" key={item.id}>
                <span className="queue-number">{String(index + 1).padStart(2, "0")}</span>
                <div className="song-info"><h2>{item.title}</h2><p>{item.artist || "Artist not given"}</p>{item.note && <blockquote>“{item.note}”</blockquote>}</div>
                <div className="requester"><span>REQUESTED BY</span><strong>{item.name}</strong><time>{new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time></div>
                <button className="delete-button" onClick={() => remove(item.id)} title="Remove request"><Trash2 size={16} /></button>
              </article>
            ))}
          </div>
        )}

        <div className="played-section">
          <div className="admin-section-heading"><span><History size={14} /> PLAYED TONIGHT</span><small>Only visible to you</small></div>
          {played.length === 0 ? (
            <p className="played-empty">Stopped songs will appear here.</p>
          ) : (
            <div className="played-list">
              {played.map((item, index) => (
                <article key={`${item.id}-${item.playedAt || index}`}>
                  <span>{String(played.length - index).padStart(2, "0")}</span>
                  <div><strong>{item.title}</strong><small>{item.artist || "Artist not given"}</small></div>
                  <time>{item.playedAt ? new Date(item.playedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}</time>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

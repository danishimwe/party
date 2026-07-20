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
          <a href="/" className="back-link"><ArrowLeft size={16} /> Retour aux demandes</a>
          <span className="brand-mark admin-mark"><LockKeyhole size={24} /></span>
          <span className="step">ACCÈS DJ UNIQUEMENT</span>
          <h1>Ouvrir la régie.</h1>
          <p>Entrez votre mot de passe administrateur pour gérer les demandes de ce soir.</p>
          <form onSubmit={(event) => { event.preventDefault(); load(); }}>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mot de passe administrateur" autoFocus required />
            {error && <span className="form-error">{error}</span>}
            <button className="submit-button" disabled={status === "loading"}>
              <span>{status === "loading" ? "Ouverture…" : "Ouvrir la régie"}</span>
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
        <button className="refresh-button" onClick={() => load(password, true)}><RefreshCw size={16} /> Actualiser</button>
      </header>

      <section className="queue-content shell">
        <div className="queue-title">
          <div><span className="step">RÉGIE DJ</span><h1>La file de ce soir</h1></div>
          <span className="count">{requests.length}</span>
        </div>

        <div className={`admin-now-playing${nowPlaying ? " active" : ""}`}>
          <div className="admin-now-copy">
            <span className="admin-live-label"><Radio size={14} /> {nowPlaying ? "EN DIRECT" : "LECTEUR PRÊT"}</span>
            <h2>{nowPlaying ? nowPlaying.title : "Aucun morceau en lecture"}</h2>
            <p>{nowPlaying ? `${nowPlaying.artist || "Artiste non renseigné"} · demandé par ${nowPlaying.name}` : "Appuyez sur Lecture pour lancer la demande nº 1."}</p>
          </div>
          {nowPlaying ? (
            <button className="stop-button" onClick={() => control("stop")} disabled={Boolean(actionStatus)}>
              {actionStatus === "stop" ? <LoaderCircle className="spin" size={20} /> : <Square size={18} fill="currentColor" />}
              Arrêter et archiver
            </button>
          ) : (
            <button className="play-button" onClick={() => control("play")} disabled={Boolean(actionStatus) || requests.length === 0}>
              {actionStatus === "play" ? <LoaderCircle className="spin" size={20} /> : <Play size={19} fill="currentColor" />}
              Lire le suivant
            </button>
          )}
        </div>

        {error && <p className="admin-action-error">{error}</p>}

        <div className="admin-section-heading"><span>EN ATTENTE</span><small>La demande la plus ancienne passe en premier</small></div>
        {requests.length === 0 ? (
          <div className="empty-state"><Disc3 size={38} /><h2>Aucune demande en attente</h2><p>Partagez la page de demandes et surveillez cet espace.</p></div>
        ) : (
          <div className="request-list">
            {requests.map((item, index) => (
              <article className="queue-item" key={item.id}>
                <span className="queue-number">{String(index + 1).padStart(2, "0")}</span>
                <div className="song-info"><h2>{item.title}</h2><p>{item.artist || "Artiste non renseigné"}</p>{item.note && <blockquote>“{item.note}”</blockquote>}</div>
                <div className="requester"><span>DEMANDÉ PAR</span><strong>{item.name}</strong><time>{new Date(item.createdAt).toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" })}</time></div>
                <button className="delete-button" onClick={() => remove(item.id)} title="Supprimer la demande"><Trash2 size={16} /></button>
              </article>
            ))}
          </div>
        )}

        <div className="played-section">
          <div className="admin-section-heading"><span><History size={14} /> JOUÉS CE SOIR</span><small>Visible uniquement par vous</small></div>
          {played.length === 0 ? (
            <p className="played-empty">Les morceaux arrêtés apparaîtront ici.</p>
          ) : (
            <div className="played-list">
              {played.map((item, index) => (
                <article key={`${item.id}-${item.playedAt || index}`}>
                  <span>{String(played.length - index).padStart(2, "0")}</span>
                  <div><strong>{item.title}</strong><small>{item.artist || "Artiste non renseigné"}</small></div>
                  <time>{item.playedAt ? new Date(item.playedAt).toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" }) : ""}</time>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

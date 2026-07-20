"use client";

import { useState } from "react";
import { ArrowRight, Check, LoaderCircle, Music2 } from "lucide-react";

const initialForm = { name: "", title: "", artist: "", note: "", website: "" };

export default function RequestForm() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Impossible d’envoyer votre demande.");
      setStatus("success");
      setForm(initialForm);
      window.dispatchEvent(new Event("song-requested"));
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  }

  if (status === "success") {
    return (
      <div className="request-card success-card" role="status">
        <div className="success-icon"><Check size={34} strokeWidth={2.5} /></div>
        <span className="step">DEMANDE REÇUE</span>
        <h3>Vous êtes dans la file.</h3>
        <p>J’ai bien reçu votre morceau. Restez près de la piste et tendez l’oreille.</p>
        <button className="text-button" onClick={() => setStatus("idle")}>Envoyer une autre demande <ArrowRight size={16} /></button>
      </div>
    );
  }

  return (
    <form className="request-card" onSubmit={submit}>
      <div className="card-heading">
        <span className="card-icon"><Music2 size={20} /></span>
        <div><span>DEMANDES OUVERTES</span><h3>Proposez votre morceau</h3></div>
      </div>

      <label>
        <span>Votre nom <i>obligatoire</i></span>
        <input name="name" value={form.name} onChange={update} placeholder="Comment dois-je vous appeler ?" maxLength={50} required />
      </label>
      <label>
        <span>Titre du morceau <i>obligatoire</i></span>
        <input name="title" value={form.title} onChange={update} placeholder="Le morceau que vous voulez entendre" maxLength={120} required />
      </label>
      <label>
        <span>Artist</span>
        <input name="artist" value={form.artist} onChange={update} placeholder="De quel artiste ?" maxLength={100} />
      </label>
      <label>
        <span>Dédicace ou message <small>facultatif</small></span>
        <textarea name="note" value={form.note} onChange={update} placeholder="Anniversaire, dédicace, urgence sur la piste…" maxLength={240} rows={3} />
      </label>
      <input className="honeypot" name="website" value={form.website} onChange={update} tabIndex="-1" autoComplete="off" aria-hidden="true" />

      {status === "error" && <p className="form-error" role="alert">{message}</p>}
      <button className="submit-button" disabled={status === "loading"}>
        <span>{status === "loading" ? "Envoi…" : "Envoyer ma demande"}</span>
        {status === "loading" ? <LoaderCircle className="spin" size={20} /> : <ArrowRight size={20} />}
      </button>
      <p className="fine-print">Les demandes sont des suggestions, sans garantie. Faites confiance au mix.</p>
    </form>
  );
}

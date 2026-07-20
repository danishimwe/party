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
      if (!response.ok) throw new Error(data.error || "Could not send your request.");
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
        <span className="step">REQUEST RECEIVED</span>
        <h3>You’re in the queue.</h3>
        <p>I’ve got your track. Stay close to the dance floor and listen out for it.</p>
        <button className="text-button" onClick={() => setStatus("idle")}>Send another request <ArrowRight size={16} /></button>
      </div>
    );
  }

  return (
    <form className="request-card" onSubmit={submit}>
      <div className="card-heading">
        <span className="card-icon"><Music2 size={20} /></span>
        <div><span>NOW ACCEPTING</span><h3>Drop your track</h3></div>
      </div>

      <label>
        <span>Your name <i>required</i></span>
        <input name="name" value={form.name} onChange={update} placeholder="What should I call you?" maxLength={50} required />
      </label>
      <label>
        <span>Song title <i>required</i></span>
        <input name="title" value={form.title} onChange={update} placeholder="The track you want to hear" maxLength={120} required />
      </label>
      <label>
        <span>Artist</span>
        <input name="artist" value={form.artist} onChange={update} placeholder="Who is it by?" maxLength={100} />
      </label>
      <label>
        <span>Dedication or note <small>optional</small></span>
        <textarea name="note" value={form.note} onChange={update} placeholder="Birthday, shout-out, dance-floor emergency…" maxLength={240} rows={3} />
      </label>
      <input className="honeypot" name="website" value={form.website} onChange={update} tabIndex="-1" autoComplete="off" aria-hidden="true" />

      {status === "error" && <p className="form-error" role="alert">{message}</p>}
      <button className="submit-button" disabled={status === "loading"}>
        <span>{status === "loading" ? "Sending…" : "Send my request"}</span>
        {status === "loading" ? <LoaderCircle className="spin" size={20} /> : <ArrowRight size={20} />}
      </button>
      <p className="fine-print">Requests are suggestions, not guarantees. Trust the mix.</p>
    </form>
  );
}

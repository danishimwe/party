"use client";

import { useCallback, useEffect, useState } from "react";
import { Disc3, LoaderCircle, Music2, Radio } from "lucide-react";

export default function LiveQueue() {
  const [requests, setRequests] = useState([]);
  const [nowPlaying, setNowPlaying] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/requests", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      setRequests(data.requests || []);
      setNowPlaying(data.nowPlaying || null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 5000);
    window.addEventListener("song-requested", load);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("song-requested", load);
    };
  }, [load]);

  return (
    <section className="public-queue-section" aria-labelledby="live-queue-title">
      <div className="shell">
        <div className="public-queue-heading">
          <div>
            <span className="step"><Radio size={13} /> LIVE FROM THE BOOTH</span>
            <h2 id="live-queue-title">The request line</h2>
          </div>
          <span className="public-count">{requests.length} waiting</span>
        </div>

        <div className={`now-playing-card${nowPlaying ? " is-playing" : ""}`}>
          <span className="now-playing-icon">{nowPlaying ? <Disc3 size={30} /> : <Music2 size={28} />}</span>
          <div>
            <span>{nowPlaying ? "NOW PLAYING" : "NOW PLAYING"}</span>
            <h3>{nowPlaying ? nowPlaying.title : "The next move is loading…"}</h3>
            <p>{nowPlaying ? (nowPlaying.artist || "Artist not given") : "DJ Scorpion is choosing the next track."}</p>
          </div>
          {nowPlaying && <i className="equalizer" aria-label="Playing"><b /><b /><b /><b /></i>}
        </div>

        {loading ? (
          <div className="public-queue-empty"><LoaderCircle className="spin" size={24} /> Loading the queue…</div>
        ) : requests.length === 0 ? (
          <div className="public-queue-empty"><Disc3 size={28} /> No songs waiting yet. Be the first to request one.</div>
        ) : (
          <ol className="public-request-list">
            {requests.map((item, index) => (
              <li key={item.id}>
                <span className="public-number">{String(index + 1).padStart(2, "0")}</span>
                <div><strong>{item.title}</strong><small>{item.artist || "Artist not given"}</small></div>
                <span className="public-requester">Requested by {item.name}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

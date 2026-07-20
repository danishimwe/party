import RequestForm from "@/components/RequestForm";
import { Disc3, Radio, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero-image" aria-hidden="true" />
        <div className="noise" aria-hidden="true" />

        <nav className="nav shell" aria-label="Main navigation">
          <a className="brand" href="#top" aria-label="DJ Scorpion home">
            <span className="brand-mark"><Disc3 size={18} /></span>
            <span>DJ SCORPION</span>
          </a>
          <span className="live-pill"><i /> Requests open</span>
        </nav>

        <div id="top" className="hero-content shell">
          <div className="eyebrow"><Radio size={15} /> Live request line</div>
          <h1>Your song.<br /><em>My next move.</em></h1>
          <p className="intro">
            Hear something you love? Drop the track below and I’ll work it into the night when the moment is right.
          </p>
          <a className="jump-link" href="#request">
            Request a track <span>↓</span>
          </a>
        </div>

        <div className="ticker" aria-hidden="true">
          <div>
            <span>HOUSE</span><b>✦</b><span>HIP-HOP</span><b>✦</b><span>R&amp;B</span><b>✦</b><span>AFROBEATS</span><b>✦</b><span>THROWBACKS</span><b>✦</b><span>YOUR REQUEST</span><b>✦</b>
            <span>HOUSE</span><b>✦</b><span>HIP-HOP</span><b>✦</b><span>R&amp;B</span><b>✦</b><span>AFROBEATS</span><b>✦</b><span>THROWBACKS</span><b>✦</b><span>YOUR REQUEST</span><b>✦</b>
          </div>
        </div>
      </section>

      <section id="request" className="request-section">
        <div className="orb orb-one" aria-hidden="true" />
        <div className="orb orb-two" aria-hidden="true" />
        <div className="request-grid shell">
          <div className="request-copy">
            <span className="step">01 / REQUEST LINE</span>
            <h2>Put me on<br />to something.</h2>
            <p>One request per person, please. I’ll read every one—but the dance floor always gets the final vote.</p>

            <div className="how-it-works">
              <div><span><Sparkles size={18} /></span><p><strong>Send your pick</strong><small>Title and artist is all I need.</small></p></div>
              <div><span><Radio size={18} /></span><p><strong>I’ll see it live</strong><small>Your request joins my private queue.</small></p></div>
              <div><span><Disc3 size={18} /></span><p><strong>Stay on the floor</strong><small>If it fits the moment, it’s going on.</small></p></div>
            </div>
          </div>
          <RequestForm />
        </div>
      </section>

      <footer>
        <div className="shell footer-inner">
          <a className="brand" href="#top"><span className="brand-mark"><Disc3 size={18} /></span><span>DJ SCORPION</span></a>
          <p>Turn it up. Make it count.</p>
          <a className="admin-link" href="/admin">DJ access</a>
        </div>
      </footer>
    </main>
  );
}

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
          <div className="hero-copy">
            <div className="eyebrow"><Radio size={15} /> Live request line</div>
            <h1>Your song.<br /><em>My next move.</em></h1>
            <p className="intro">
              Hear something you love? Drop the track below and I’ll work it into the night when the moment is right.
            </p>
            <a className="jump-link" href="#request">
              More about requests <span>↓</span>
            </a>
          </div>
          <div className="hero-form">
            <RequestForm />
          </div>
        </div>

        <div className="ticker" aria-hidden="true">
          <div>
            <span>HOUSE</span><b>✦</b><span>HIP-HOP</span><b>✦</b><span>R&amp;B</span><b>✦</b><span>AFROBEATS</span><b>✦</b><span>THROWBACKS</span><b>✦</b><span>YOUR REQUEST</span><b>✦</b>
            <span>HOUSE</span><b>✦</b><span>HIP-HOP</span><b>✦</b><span>R&amp;B</span><b>✦</b><span>AFROBEATS</span><b>✦</b><span>THROWBACKS</span><b>✦</b><span>YOUR REQUEST</span><b>✦</b>
          </div>
        </div>
      </section>
    </main>
  );
}

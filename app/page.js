import RequestForm from "@/components/RequestForm";
import LiveQueue from "@/components/LiveQueue";
import { Disc3, Radio } from "lucide-react";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero-image" aria-hidden="true" />
        <div className="noise" aria-hidden="true" />

        <nav className="nav shell" aria-label="Navigation principale">
          <a className="brand" href="#top" aria-label="Accueil de DJ Scorpion">
            <span className="brand-mark"><Disc3 size={18} /></span>
            <span>DJ SCORPION</span>
          </a>
          <span className="live-pill"><i /> Demandes ouvertes</span>
        </nav>

        <div id="top" className="hero-content shell">
          <div className="hero-copy">
            <div className="eyebrow"><Radio size={15} /> Demandes en direct</div>
            <h1>Votre morceau.<br /><em>À moi de jouer.</em></h1>
            <p className="intro">
              Une envie particulière ? Proposez votre morceau et je l’intégrerai à la soirée au moment idéal.
            </p>
            <a className="jump-link" href="#file-demandes">
              Voir la file <span>↓</span>
            </a>
          </div>
          <div className="hero-form">
            <RequestForm />
          </div>
        </div>

        <div className="ticker" aria-hidden="true">
          <div>
            <span>HOUSE</span><b>✦</b><span>HIP-HOP</span><b>✦</b><span>R&amp;B</span><b>✦</b><span>AFROBEATS</span><b>✦</b><span>CLASSIQUES</span><b>✦</b><span>VOTRE DEMANDE</span><b>✦</b>
            <span>HOUSE</span><b>✦</b><span>HIP-HOP</span><b>✦</b><span>R&amp;B</span><b>✦</b><span>AFROBEATS</span><b>✦</b><span>CLASSIQUES</span><b>✦</b><span>VOTRE DEMANDE</span><b>✦</b>
          </div>
        </div>
      </section>
      <LiveQueue />
    </main>
  );
}

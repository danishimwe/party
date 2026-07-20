import "./globals.css";

export const metadata = {
  title: "Demandez un morceau — DJ Scorpion",
  description: "Envoyez votre demande de morceau directement à DJ Scorpion.",
  metadataBase: new URL("https://dj-scorpion.vercel.app"),
  openGraph: {
    title: "Demandez un morceau — DJ Scorpion",
    description: "Quel morceau DJ Scorpion devrait-il passer ensuite ?",
    images: ["/dj-scorpion.jpg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}

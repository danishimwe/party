import "./globals.css";

export const metadata = {
  title: "Request a track — DJ Scorpion",
  description: "Send your song request straight to DJ Scorpion.",
  metadataBase: new URL("https://dj-scorpion.vercel.app"),
  openGraph: {
    title: "Request a track — DJ Scorpion",
    description: "What should DJ Scorpion play next?",
    images: ["/dj-scorpion.jpg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

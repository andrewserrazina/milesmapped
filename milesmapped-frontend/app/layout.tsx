import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from "../components/NavBar";

export const metadata: Metadata = {
  title: "MilesMapped | Travel with Points and Miles",
  description:
    "Plan and book flights and hotels with points and miles using MilesMapped's intuitive concierge tools.",
  openGraph: {
    title: "MilesMapped | Travel with Points and Miles",
    description:
      "Plan and book flights and hotels with points and miles using MilesMapped's intuitive concierge tools.",
    url: "https://milesmapped.com",
    siteName: "MilesMapped",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "MilesMapped travel planning"
      }
    ],
    locale: "en_US",
    type: "website"
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        <main className="px-6 py-10">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </body>
    </html>
  );
}

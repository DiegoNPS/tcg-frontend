import type { Metadata } from "next";
import "./globals.css";

import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";

export const metadata: Metadata = {
  title: {
    default: "TCG Tournaments",
    template: "%s | TCG Tournaments",
  },
  description: "Descubre, publica y gestiona torneos de trading card games en Chile.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className="h-full antialiased"
    >
      <body className="min-h-full bg-background text-foreground">
        <a href="#main-content" className="ui-skip-link">
          Saltar al contenido principal
        </a>
        <div className="flex min-h-full flex-col">
          <Navbar />
          <div id="main-content" tabIndex={-1} className="flex flex-1 flex-col">
            {children}
          </div>
          <Footer />
        </div>
      </body>
    </html>
  );
}

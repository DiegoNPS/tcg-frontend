import type { Metadata } from "next";
import "./globals.css";

import { Navbar } from "@/components/ui/navbar";

export const metadata: Metadata = {
  title: {
    default: "TCG Torneos",
    template: "%s | TCG Torneos",
  },
  description: "Gestiona y publica torneos de trading card games con Supabase y Next.js.",
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
        </div>
      </body>
    </html>
  );
}

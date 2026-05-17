import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TinyNotes",
  description: "TinyNotes app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="shell">{children}</main>
      </body>
    </html>
  );
}

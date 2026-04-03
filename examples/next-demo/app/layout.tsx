import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevLens Next Demo",
  description: "Demo app for testing the DevLens in-app inspector.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

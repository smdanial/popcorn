import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "PopCorn — your watch life, measured",
    template: "%s · PopCorn",
  },
  description:
    "Track films and series, build lists, and see exactly where your lifetime hours went. A Letterboxd-style diary with Serializd-grade time analytics.",
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}

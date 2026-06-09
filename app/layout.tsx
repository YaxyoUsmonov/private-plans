import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Private Plans",
  description: "Shaxsiy o‘sish tizimi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body>{children}</body>
    </html>
  );
}

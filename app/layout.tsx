import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MindWell",
  description: "Mental wellness dashboard and assessment experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light">
      <body>{children}</body>
    </html>
  );
}

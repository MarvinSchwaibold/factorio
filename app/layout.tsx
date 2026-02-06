import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { AgentationWrapper } from "@/components/AgentationWrapper";

export const metadata: Metadata = {
  title: "Shopiforio Agent",
  description: "Agentic Interface",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="antialiased">
        {children}
        <AgentationWrapper />
      </body>
    </html>
  );
}

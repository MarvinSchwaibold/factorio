import type { Metadata } from "next";
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
    <html lang="en">
      <body className="antialiased bg-black text-agent-green selection:bg-agent-green selection:text-black">
        {children}
        <AgentationWrapper />
      </body>
    </html>
  );
}

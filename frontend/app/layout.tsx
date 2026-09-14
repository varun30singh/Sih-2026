import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/components/common/LanguageContext";
import { ChatbotProvider, ChatbotWidget } from "@/components/chatbot";

export const metadata: Metadata = {
  title: "MandiSetu — Smart Procurement. Zero Waiting.",
  description:
    "An intelligent procurement-centre queue and farmer management platform designed to eliminate waiting time at government mandis.",
  keywords: [
    "MandiSetu",
    "Smart India Hackathon 2026",
    "MSP Procurement",
    "Farmer Queue Management",
    "Digital Token",
    "Zero Waiting",
    "Digital Twin Mandi",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans antialiased">
        <LanguageProvider>
          <ChatbotProvider>
            {children}
            <ChatbotWidget />
          </ChatbotProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

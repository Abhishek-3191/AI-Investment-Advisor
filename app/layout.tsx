import type { Metadata } from "next";
import { ConvexClientProvider } from "./ConvexClientProvider";
import {
  ClerkProvider,
  
} from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import AIProvider from "./providers"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Investment Advisor",
  description: "Voice-first AI investment guidance",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <ConvexClientProvider><AIProvider>{children}</AIProvider></ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}


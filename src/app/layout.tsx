import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { HeroUIProvider } from "@heroui/react";
import Header from "@/components/header";
import { GoogleAnalytics } from '@next/third-parties/google'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ossett and District Snooker League",
  description: "Welcome to the Ossett and District Snooker League!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <HeroUIProvider>
          <Header />
          <main className="max-w-full m-4 md:mt-4 md:m-auto md:max-w-[750px] lg:max-w-[900px]">
            {children}
          </main>
        </HeroUIProvider>

        <GoogleAnalytics gaId="G-BW35Y072VE" />
      </body>
    </html>
  );
}

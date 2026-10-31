import type { Metadata } from "next";
import { Albert_Sans, DM_Serif_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { StoreProvider } from "@/lib/store";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const fontSans = Albert_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "PLMun Registrar - Student Document Request & Scheduling Portal",
  description:
    "Official Document Request & Claim Scheduling System of Pamantasan ng Lungsod ng Muntinlupa",
  icons: {
    icon: "/plmun-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} font-sans min-h-screen flex flex-col bg-background text-foreground antialiased`}
      >
        <ThemeProvider>
          <StoreProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

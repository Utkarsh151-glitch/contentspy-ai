import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "ContentSpy AI — Competitor Intelligence Platform",
  description:
    "AI-powered competitor analysis. Enter any URL to get deep insights on SEO strategy, top content, keywords, and growth opportunities.",
  keywords: [
    "competitor analysis",
    "SEO intelligence",
    "AI competitor research",
    "content strategy",
    "market intelligence",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{
          __html: `
          (function() {
            try {
              document.documentElement.classList.add('dark');
              var t = localStorage.getItem('cs_theme');
              if (t) document.documentElement.classList.add(t);
            } catch(e) {
              document.documentElement.classList.add('dark');
            }
          })();
        `}} />
      </head>
      <body className={`${inter.variable} antialiased font-sans`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Script
          src="https://js.puter.com/v2/"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}

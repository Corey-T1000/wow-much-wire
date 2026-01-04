import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "WireWise - Automotive Wiring Visualization",
    template: "%s | WireWise",
  },
  description:
    "Interactive wiring diagram tool for automotive projects. Visualize connections, validate circuits, and get AI-powered verification for your vehicle rewire.",
  keywords: [
    "automotive",
    "wiring",
    "diagram",
    "Miata",
    "PDM",
    "ECU",
    "MS3Pro",
    "electrical",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "WireWise",
    title: "WireWise - Automotive Wiring Visualization",
    description:
      "Interactive wiring diagram tool for automotive projects with AI-powered verification",
  },
  twitter: {
    card: "summary_large_image",
    title: "WireWise - Automotive Wiring Visualization",
    description:
      "Interactive wiring diagram tool for automotive projects with AI-powered verification",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// JSON-LD structured data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "WireWise",
  description:
    "Interactive wiring diagram tool for automotive projects with AI-powered verification",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SiteHeader />
          <main id="main-content">{children}</main>
          <SiteFooter />
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}

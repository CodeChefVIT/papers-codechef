import "@/styles/globals.css";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/theme-provider";
import { GeistSans } from "geist/font/sans";
import Script from "next/script";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://papers.codechefvit.com/"),
  title: "Papers by CodeChef-VIT | Explore VIT Previous Year Question Papers",
  description:
    "Discover previous year question papers created by CodeChef-VIT at Vellore Institute of Technology. Made with ♡ to help students excel.",
  icons: [{ rel: "icon", url: "/codechef_logo.svg" }],
  openGraph: {
    title: "Papers by CodeChef-VIT | Exam Resources",
    images: [{ url: "/papers.png" }],
    url: "https://papers.codechefvit.com/",
    type: "website",
    description:
      "Discover previous year question papers created by CodeChef-VIT at Vellore Institute of Technology. Made with ♡ to help students excel.",
    siteName: "Papers by CodeChef-VIT",
  },
  twitter: {
    card: "summary_large_image",
    title: "Papers by CodeChef-VIT | VIT Previous Year Question Papers",
    description:
      "Discover previous year question papers created by CodeChef-VIT at Vellore Institute of Technology. Made with ♡ to help students excel.",
    images: [{ url: "/papers.png" }],
  },
  applicationName: "Papers by CodeChef-VIT",
  keywords: [
    "CodeChef",
    "VIT",
    "VIT Papers",
    "Vellore Institute of Technology",
    "CodeChef-VIT",
    "Papers",
    "Exam solutions",
    "Student resources",
    "VIT exam papers",
    "Exam preparation",
    "Previous year papers VIT",
    "VITCAT1",
    "VITCAT2",
    "VITFAT",
    "VIT CAT1 papers",
    "VIT CAT2 papers",
    "VIT FAT papers",
    "VIT exam question papers",
    "VIT question bank",
    "VIT previous year question papers",
    "VIT academic resources",
    "VIT exam pattern",
    "VIT preparation tips",
    "VIT question solutions",
    "VIT model papers",
    "VIT solved papers",
    "VIT test papers",
    "VIT sample papers",
    "VIT question papers with solutions",
    "VIT exam guide",
    "VIT CAT1 preparation",
    "VIT CAT2 preparation",
    "VIT FAT preparation",
    "VIT previous year CAT1 papers",
    "VIT previous year CAT2 papers",
    "VIT previous year FAT papers",
    "VIT exam resources",
    "VIT academic help",
    "VIT syllabus",
    "VIT question paper pattern",
    "VIT 2023 papers",
    "VIT 2024 papers",
    "VIT exam practice",
    "VIT question paper archives",
    "VIT study materials",
    "VIT engineering papers",
    "VIT exam strategy",
    "VIT online exam resources",
    "VIT question paper download",
    "VIT important questions",
    "VIT question paper solutions",
  ],
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <meta
        name="google-site-verification"
        content="SjVFuH8GzIj3Ooh2JcWufBoSMWTzo77TACHomonCKVs"
      />
      <head>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-J5CD036GJP"
        ></Script>
        <Script id="google-analytics">
          {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-J5CD036GJP');`}
        </Script>
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster position="top-right" reverseOrder={false} />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

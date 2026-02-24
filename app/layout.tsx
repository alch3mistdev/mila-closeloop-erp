import type { Metadata } from "next";
import "./globals.css";

const siteDescription =
  "Automated validation for heterogeneous-to-SAP migrations. Surface discrepancies before they become board-level reporting errors.";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "CloseLoop",
      url: "https://close-loop.app",
      email: "hello@close-loop.app"
    },
    {
      "@type": "WebSite",
      name: "CloseLoop",
      url: "https://close-loop.app",
      description: siteDescription
    },
    {
      "@type": "SoftwareApplication",
      name: "CloseLoop",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: siteDescription
    }
  ]
};

export const metadata: Metadata = {
  metadataBase: new URL("https://close-loop.app"),
  title: "CloseLoop | Migration Integrity Platform",
  description: siteDescription,
  keywords: [
    "ERP migration validation",
    "SAP data validation",
    "cross-plant reconciliation",
    "heterogeneous source migration",
    "migration discrepancy detection"
  ],
  alternates: {
    canonical: "/"
  },
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    title: "CloseLoop | Migration Integrity Platform",
    description: "Automated migration validation built for cross-plant comparability, discrepancy detection, and remediation tracking.",
    url: "https://close-loop.app",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CloseLoop migration validation workflow and diagnostic interface"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "CloseLoop | Migration Integrity Platform",
    description: siteDescription,
    images: ["/og-image.png"]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <script
          type="application/ld+json"
          // Metadata-only structured data to improve discoverability in pre-launch mode.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}

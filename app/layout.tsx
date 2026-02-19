import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ERP Migration Validation Engine",
  description:
    "Automated validation for heterogeneous-to-SAP migrations. Surface discrepancies before they become board-level reporting errors.",
  openGraph: {
    title: "ERP Migration Validation Engine",
    description:
      "Automated migration validation built for cross-plant comparability, discrepancy detection, and remediation tracking.",
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
      <body>{children}</body>
    </html>
  );
}

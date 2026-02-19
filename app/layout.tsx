import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://closeloop.app"),
  title: "CloseLoop | Migration Integrity Platform",
  description:
    "Automated validation for heterogeneous-to-SAP migrations. Surface discrepancies before they become board-level reporting errors.",
  openGraph: {
    title: "CloseLoop | Migration Integrity Platform",
    description:
      "Automated migration validation built for cross-plant comparability, discrepancy detection, and remediation tracking.",
    images: ["/closeloop-logo.svg"]
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

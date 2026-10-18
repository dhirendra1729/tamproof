import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Evidence Vault | Tamper-Proof Digital Forensics",
  description: "Digital forensics vault powered by custom C++17 data structures, Merkle trees, and hash-chain audit logging.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0e14] text-[#e5e7eb] antialiased selection:bg-cyan-500/20 selection:text-cyan-300">
        {children}
      </body>
    </html>
  );
}

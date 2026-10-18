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
    <html lang="en">
      <body className="bg-[#F2F7F4] text-[#223326] antialiased selection:bg-[#5A7D5C]/20 selection:text-[#223326]">
        {children}
      </body>
    </html>
  );
}

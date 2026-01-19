import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Welshare Questionnaire Demo",
  description: "Demo: Two ways to submit FHIR questionnaires to Welshare profiles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}

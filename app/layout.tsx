import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pagsibol Village - Northeastern Naic (PVNE)",
  description: "The official community portal concept for Pagsibol Village - Northeastern Naic (PVNE).",
  applicationName: "Pagsibol Village - Northeastern Naic (PVNE)"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

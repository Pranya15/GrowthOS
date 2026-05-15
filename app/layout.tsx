import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/components/app-provider";

export const metadata: Metadata = {
  title: "Growth OS",
  description: "AI-powered learning and career growth platform for any domain."
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}

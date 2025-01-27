import type { Metadata } from "next";
import { Roboto, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"], // Add desired weights
  variable: "--font-roboto",
});

const IBMPlex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex",
});

export const metadata: Metadata = {
  title: "AI. Magix",
  description: "Remove background, Enhance photos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${IBMPlex.variable} ${roboto.variable} antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

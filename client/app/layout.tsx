import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { AppContextProvider } from "@/contexts/Context";
import UserInfo from "@/utils/UserInfo";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "掲示板サイト",
  description: "Next.js, Node.jsで作成した掲示板サイト",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppContextProvider>
          <UserInfo />
          <hr className="mb-8" />
          {children}
        </AppContextProvider>
      </body>
    </html>
  );
}

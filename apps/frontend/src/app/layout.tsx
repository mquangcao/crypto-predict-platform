import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";
import { Providers } from "@/providers";
import { Topbar } from "@/components/layout/main/topbar";
import { Footer } from "@/components/layout/main/footer";

// Configure Poppins globally
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Crypto Insight Platform",
  description: "Realtime price, news & AI insight for crypto pairs",
  icons: {
    icon: [
      {
        rel: "stylesheet",
        url: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap",
      },
    ],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={poppins.variable}
      style={{ colorScheme: "light" }}
    >
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Topbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}

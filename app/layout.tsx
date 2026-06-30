import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { AppwriteProvider } from "@/lib/contexts/AppwriteContext";
import { ToastProvider } from "@/lib/contexts/ToastContext";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import OfflineProvider from "@/lib/contexts/OfflineProvider";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ShopKin — Marketplace de Kinshasa",
  description:
    "Achetez et vendez facilement à Kinshasa. Marketplace PWA minimaliste.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${plusJakartaSans.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-surface text-muted">
        <ErrorBoundary>
          <OfflineProvider>
            <AppwriteProvider>
              <ToastProvider>
                <a
                  href="#main-content"
                  className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[999] focus:bg-white focus:p-3 focus:text-sm focus:font-semibold focus:text-primary focus:shadow-lg"
                >
                  Aller au contenu principal
                </a>
                {children}
              </ToastProvider>
            </AppwriteProvider>
          </OfflineProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

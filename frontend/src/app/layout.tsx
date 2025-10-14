import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from '@/components/theme-provider'
import { Providers } from "@/lib/providers";
import { Navigation } from "@/components/navigation";
import { MobileNavigation } from "@/components/mobile-navigation";
import ErrorBoundary from "@/components/error-boundary";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Job Application Tracker",
  description: "Track your job applications, interviews, and offers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Providers>
            <ErrorBoundary>
              <div className="h-full relative">
                <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-80">
                  <Navigation />
                </div>
              
                <MobileNavigation />
                
                <main className="md:pl-72 pb-10 pt-16 md:pt-0">
                  <div className="px-4 py-6 md:px-8">
                    {children}
                  </div>
                </main>
              </div>
            </ErrorBoundary>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}

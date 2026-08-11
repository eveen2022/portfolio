import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { FloatingMenu } from "@/components/theme/FloatingMenu";
import { LiveProvider } from "@/components/live/LiveProvider";
import { getSiteConfig } from "@/lib/data";
import { siteMeta } from "@/lib/site";
import { findCustomFavicon } from "@/lib/favicon";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const [siteConfig, customFavicon] = await Promise.all([
    getSiteConfig(),
    findCustomFavicon(),
  ]);

  return {
    metadataBase: new URL(siteMeta.siteUrl),
    title: {
      default: `${siteConfig.name} — ${siteConfig.role}`,
      template: `%s — ${siteConfig.name}`,
    },
    description: siteConfig.description,
    icons: customFavicon ? { icon: customFavicon.url } : undefined,
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          nonce={nonce}
        >
          <LiveProvider>
            {children}
            <FloatingMenu />
          </LiveProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

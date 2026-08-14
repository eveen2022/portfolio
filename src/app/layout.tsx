import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { FloatingMenu } from "@/components/theme/FloatingMenu";
import { LiveProvider } from "@/components/live/LiveProvider";
import { getSiteConfig } from "@/lib/data";
import { siteMeta } from "@/lib/site";
import { findCustomFavicon } from "@/lib/favicon";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
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

  const title = `${siteConfig.name} — ${siteConfig.role}`;
  const ogImage = siteConfig.seo.ogImage || siteConfig.photo || undefined;

  return {
    metadataBase: new URL(siteMeta.siteUrl),
    title: {
      default: title,
      template: `%s — ${siteConfig.name}`,
    },
    description: siteConfig.description,
    icons: customFavicon ? { icon: customFavicon.url } : undefined,
    // No `alternates.canonical` here on purpose — Next merges unset keys
    // from the nearest ancestor layout, so a blanket canonical set here
    // would silently apply to every page that doesn't set its own. Each
    // route sets its own canonical instead (see buildPageMetadata).
    openGraph: {
      title,
      description: siteConfig.description,
      url: siteMeta.siteUrl,
      siteName: siteConfig.name,
      type: "website",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description: siteConfig.description,
      images: ogImage ? [ogImage] : undefined,
      site: siteConfig.seo.twitterHandle || undefined,
      creator: siteConfig.seo.twitterHandle || undefined,
    },
    robots: siteConfig.seo.noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    verification: {
      google: siteConfig.seo.googleSiteVerification || undefined,
      other: siteConfig.seo.bingSiteVerification
        ? { "msvalidate.01": siteConfig.seo.bingSiteVerification }
        : undefined,
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [nonce, siteConfig, cookieStore] = await Promise.all([
    headers().then((h) => h.get("x-nonce") ?? undefined),
    getSiteConfig(),
    cookies(),
  ]);
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const isAdminSession = token ? await verifySessionToken(token) : false;
  // Visitors during maintenance/404 mode land on that placeholder page (via
  // proxy.ts's rewrite) no matter what URL they're on, so the floating
  // menu's Contact link would otherwise dangle there uselessly. Same for the
  // Contact section itself being turned off. The admin bypasses the rewrite
  // and keeps browsing the real site, so their Contact link stays as normal.
  const hideContactForSiteStatus =
    (siteConfig.maintenanceMode || siteConfig.notFoundMode || !siteConfig.sections.contact) &&
    !isAdminSession;

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
            <FloatingMenu
              hideContact={hideContactForSiteStatus}
              whatsapp={siteConfig.social.whatsapp}
            />
          </LiveProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

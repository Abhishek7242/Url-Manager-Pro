// src/components/HeadMeta.jsx
import React, { useEffect } from "react";

/**
 * HeadMeta
 * React 19-friendly replacement for react-helmet(-async).
 *
 * Usage:
 * <HeadMeta canonicalUrl="https://lynkr.com/" />
 *
 * Notes:
 * - React 19 will hoist these tags into <head>.
 * - <html lang="..."> cannot be injected via JSX reliably, so we set document.documentElement.lang in an effect.
 * - JSON-LD uses dangerouslySetInnerHTML to ensure correct string content in the <script>.
 */
export default function HeadMeta({
  canonicalUrl = typeof window !== "undefined"
    ? window.location.origin + "/"
    : "https://example.com/",
  title = "URL Manager — Shorten, Manage & Track Links | Custom Domains · Analytics",
  description = `URL Manager helps teams and creators shorten, brand, and measure links. Manage custom domains, campaign tracking, link governance, and analytics — all with a fast, modern interface.`,
  keywords = "url manager, short links, save links, link management, branded links, custom domains, link analytics, campaign tracking, url shortener, link governance",
  author = "URL Manager",
  image = "/og-image.png",
  locale = "en_US",
  siteName = "URL Manager",
  themeColor = "#0b1220",
  lang = "en",
}) {
  useEffect(() => {
    // set the <html lang="..."> attribute (React can't reliably render <html> from a component)
    try {
      if (typeof document !== "undefined" && document.documentElement) {
        document.documentElement.lang = lang;
      }
    } catch (e) {
      /* ignore in non-browser envs */
    }
  }, [lang]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${canonicalUrl}#website`,
        url: canonicalUrl,
        name: siteName,
        description:
          "URL Manager centralises link operations: custom domains, campaign tracking, governance and team workflows with real-time analytics.",
      },
      {
        "@type": "Organization",
        "@id": `${canonicalUrl}#org`,
        name: siteName,
        url: canonicalUrl,
        logo: `${canonicalUrl}logo.png`,
      },
      {
        "@type": "SoftwareApplication",
        name: siteName,
        operatingSystem: "Web",
        applicationCategory: "BusinessApplication",
        url: canonicalUrl,
        description:
          "URL Manager offers advanced link shortening, branding, tracking, and governance tools for teams and enterprises.",
      },
    ],
  };

  return (
    <>
      {/* Basic / Meta */}
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <link rel="canonical" href={canonicalUrl} />
      <meta
        name="robots"
        content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
      />

      {/* Favicons & PWA */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="shortcut icon" href="/favicon.ico" />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href={`${canonicalUrl}apple-touch-icon.png`}
      />
      <link rel="manifest" href="/site.webmanifest" />
      <meta name="theme-color" content={themeColor} />
      <meta name="msapplication-TileColor" content={themeColor} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:locale" content={locale} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta
        property="og:image:alt"
        content={`${siteName} — Link management and analytics dashboard`}
      />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Structured data (JSON-LD) */}
      <script
        type="application/ld+json"
        // JSON-LD must be a string inside the script tag to be valid
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Helpful extras for SEO / indexing */}
      <link
        rel="search"
        type="application/opensearchdescription+xml"
        title={`Search ${siteName}`}
        href="/opensearch.xml"
      />
      <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
    </>
  );
}

// src/components/HeadMeta.jsx
import React, { useEffect, useMemo } from "react";

/**
 * HeadMeta
 * React-19 friendly head helper with expanded SEO + social markup.
 * ... (Usage notes remain the same)
 */
export default function HeadMeta({
  canonicalUrl = typeof window !== "undefined"
    ? window.location.origin + "/"
    : "https://www.urlmg.com/", 
  // 1. UPDATED TITLE: Emphasize Security, AI, and Management
  title = "URL Manager — Save, Share, and Analyze Your Links | URL Manager”",
  // 2. UPDATED DESCRIPTION: Focus on analysis, security, and advanced features
  description = `Url Manager helps you save, organize, share, and analyze your links in one clean dashboard. Create collections, manage tags, shorten URLs, and access link insights with ease.`,
  // 3. UPDATED KEYWORDS: Added security, AI, and health-related terms
  keywords = "ai url manager,lik manager, url manager, save links, malicious link detection, url security, link analysis, link governance, link health, save links, custom domains, url shortener, link management platform",
  author = "URL Manager",
  image = "/og-image.png",
  imageWidth, // For og:image:width
  imageHeight, // For og:image:height
  locale = "en_US",
  siteName = "URL Manager",
  themeColor = "#0b1220",
  lang = "en",
  twitterCreator = "@yourhandle",
  socialProfiles = [
    "https://twitter.com/yourhandle",
    "https://www.linkedin.com/company/yourcompany",
  ],
  publisherLogo = "/urlmanager.png",
  canonicalPath = "",
}) {
  // normalize canonical (logic remains the same)
  const canonical = useMemo(() => {
    try {
      const base = new URL(canonicalUrl);
      let url = canonicalPath
        ? new URL(canonicalPath, base).toString()
        : base.toString();
      const pathname = new URL(url).pathname;
      const isRootPath = pathname === "/" || pathname === "";

      if (isRootPath && !url.endsWith("/")) {
        url = url + "/";
      }
      return url;
    } catch (e) {
      return canonicalUrl;
    }
  }, [canonicalUrl, canonicalPath]);

  // Determine if this is the root path (important for JSON-LD breadcrumbs)
  const isRootPath = useMemo(() => {
    try {
      const pathname = new URL(canonical).pathname;
      return pathname === "/" || pathname === "";
    } catch (e) {
      return true;
    }
  }, [canonical]);

  useEffect(() => {
    try {
      if (typeof document !== "undefined" && document.documentElement) {
        document.documentElement.lang = lang;
      }
    } catch (e) {
      // server env - ignore
    }
  }, [lang]);

  // JSON-LD structured data: WebSite, Organization, WebPage, SoftwareApplication
  const jsonLd = useMemo(() => {
    const now = new Date().toISOString();
    const graph = [];

    const webSite = {
      "@type": "WebSite",
      "@id": `${canonical}#website`,
      url: canonical,
      name: siteName,
      description: description,
      publisher: {
        "@id": `${canonical}#org`,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: `${canonical}search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    };
    graph.push(webSite);

    const organization = {
      "@type": "Organization",
      "@id": `${canonical}#org`,
      name: siteName,
      url: canonical,
      logo: {
        "@type": "ImageObject",
        url: new URL(publisherLogo, canonical).toString(),
      },
      sameAs: Array.isArray(socialProfiles) ? socialProfiles : [],
    };
    graph.push(organization);

    // WebPage is the main wrapper for all pages
    const webPage = {
      "@type": "WebPage",
      "@id": `${canonical}#webpage`,
      url: canonical,
      name: title,
      isPartOf: { "@id": `${canonical}#website` },
      about: { "@id": `${canonical}#org` },
      description: description,
      inLanguage: lang,
      datePublished: now,
      dateModified: now,
      mainEntity: { "@id": `${canonical}#software` },
      ...(!isRootPath && { breadcrumb: { "@id": `${canonical}#breadcrumbs` } }),
    };
    graph.push(webPage);

    // 4. UPDATED SOFTWARE APPLICATION: Use SecurityApplication and add features
    const softwareApplication = {
      "@type": "SoftwareApplication",
      "@id": `${canonical}#software`,
      name: title,
      operatingSystem: "Web",
      // Use SecurityApplication or BusinessApplication/UtilityApplication
      applicationCategory: "https://schema.org/SecurityApplication",
      url: canonical,
      description: description,
      // Adding key features for better context
      featureList: [
        "Malicious Link Detection (AI/ML)",
        "Link Reminders & Link Health Monitoring",
        "Link Governance and Access Control",
        "Real-Time Link Analytics",
      ],
    };
    graph.push(softwareApplication);

    // Only include breadcrumbs if not the root path
    if (!isRootPath) {
      const breadcrumbs = {
        "@type": "BreadcrumbList",
        "@id": `${canonical}#breadcrumbs`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: siteName,
            item: canonicalUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: title,
            item: canonical,
          },
        ],
      };
      graph.push(breadcrumbs);
    }

    return {
      "@context": "https://schema.org",
      "@graph": graph,
    };
  }, [
    canonical,
    canonicalUrl,
    description,
    siteName,
    title,
    socialProfiles,
    publisherLogo,
    lang,
    isRootPath,
  ]);

  // Alternate / hreflang links
  const alternates = [
    { rel: "alternate", hrefLang: lang, href: canonical },
    { rel: "alternate", hrefLang: "x-default", href: canonicalUrl },
  ];

  const fullImageUrl = image.startsWith("http")
    ? image
    : new URL(image, canonical).toString();
  const faviconUrl = new URL("/favicon.ico", canonical).toString();

  return (
    <>
      {/* Basic / Meta */}
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <link rel="canonical" href={canonical} />
      <meta
        name="robots"
        content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
      />

      {/* App-style / mobile */}
      <meta name="theme-color" content={themeColor} />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-title" content={siteName} />

   <link rel="icon" href={faviconUrl} sizes="any" type="image/x-icon" />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href={new URL("/apple-touch-icon.png", canonical).toString()}
      />
      <link rel="manifest" href="/site.webmanifest" />

      {/* Preconnect / DNS-prefetch (Good as is) */}
      <link
        rel="preconnect"
        href="https://fonts.googleapis.com"
        crossOrigin="anonymous"
      />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />

      {/* Alternate / hreflang */}
      {alternates.map((a) => (
        <link
          key={a.hrefLang}
          rel={a.rel}
          hrefLang={a.hrefLang}
          href={a.href}
        />
      ))}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:locale" content={locale} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={fullImageUrl} />
      {imageWidth && <meta property="og:image:width" content={imageWidth} />}
      {imageHeight && <meta property="og:image:height" content={imageHeight} />}
      <meta
        property="og:image:alt"
        content={`Dashboard for link security, analytics, and AI management`}
      />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      {twitterCreator && (
        <meta name="twitter:creator" content={twitterCreator} />
      )}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />

      {/* Structured data (JSON-LD) - REFINED */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* optional: site search description (opensearch) & sitemap */}
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

import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";

export interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "profile" | "event";
  author?: string;
  pageKey?: string;
  eventData?: {
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    locationName?: string;
    locationAddress?: string;
    city?: string;
    image?: string;
    price?: number | string;
    currency?: string;
    isFree?: boolean;
    url?: string;
  };
  structuredData?: Record<string, any> | Record<string, any>[];
}

const DEFAULT_TITLE = "Executive Talks Media Business Intelligence | India's Premier CXO Summit Platform";
const DEFAULT_DESC = "Executive Talks Media Business Intelligence curates India's premier C-suite conferences, CFO leadership summits, national HR awards, Enterprise AI conclaves, and Executive Talks Magazine.";
const DEFAULT_KEYWORDS = "Executive Talks Media, Executive Talks, Executive Talks Media Business Intelligence, Executive Talks India, Executive Talks Hyderabad, Executive Talks Magazine, Executive Talks Summits, Executive Talks Media Console, Executive Talks Search Console, India CFO Summit, National HR Excellence Awards, Enterprise Technology AI Conclave, CXO Conferences India, B2B Leadership Summits, Corporate Awards India, Business Intelligence India, Hyderabad B2B Events, C-Suite Networking India";
const DEFAULT_IMAGE = "https://www.executivetalksmedia.in/assets/hero-summit-ClCGVqfO.jpg";
const BASE_URL = "https://www.executivetalksmedia.in";

// In-memory cache for dynamic SEO settings from backend
let seoSettingsCache: Record<string, { title: string; description: string; keywords: string; og_image?: string }> | null = null;
let isFetchingSeo = false;

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  image,
  url,
  type = "website",
  author = "Executive Talks Media Business Intelligence",
  pageKey,
  eventData,
  structuredData,
}) => {
  const [dbSeo, setDbSeo] = useState<{ title?: string; description?: string; keywords?: string; og_image?: string } | null>(null);

  // Fetch dynamic SEO settings from DB if pageKey is supplied
  useEffect(() => {
    if (!pageKey) return;

    if (seoSettingsCache && seoSettingsCache[pageKey]) {
      setDbSeo(seoSettingsCache[pageKey]);
      return;
    }

    if (!isFetchingSeo && !seoSettingsCache) {
      isFetchingSeo = true;
      fetch("/api/seo")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.seo)) {
            const cache: Record<string, any> = {};
            data.seo.forEach((s: any) => {
              cache[s.page_key] = s;
            });
            seoSettingsCache = cache;
            if (cache[pageKey]) {
              setDbSeo(cache[pageKey]);
            }
          }
        })
        .catch(() => {})
        .finally(() => {
          isFetchingSeo = false;
        });
    }
  }, [pageKey]);

  // Compute final metadata
  let rawTitle = dbSeo?.title || title || DEFAULT_TITLE;
  // Eliminate any legacy "ET Media" or "ETMedia" from database or cached settings
  rawTitle = rawTitle.replace(/ET\s*Media/gi, "Executive Talks Media").trim();
  const fullTitle = rawTitle.includes("Executive Talks Media") ? rawTitle : `${rawTitle} | Executive Talks Media`;
  
  let metaDescription = dbSeo?.description || description || DEFAULT_DESC;
  metaDescription = metaDescription.replace(/ET\s*Media/gi, "Executive Talks Media").trim();
  
  // Ensure "Executive Talks Media" is always part of the keywords string
  const baseKeywords = (dbSeo?.keywords || keywords || DEFAULT_KEYWORDS).replace(/ET\s*Media/gi, "Executive Talks Media");
  const fullKeywords = baseKeywords.includes("Executive Talks Media")
    ? baseKeywords
    : `Executive Talks Media, Executive Talks, ${baseKeywords}`;

  const canonicalUrl = url || (typeof window !== "undefined" ? window.location.href : BASE_URL);
  const metaImage = dbSeo?.og_image || image || DEFAULT_IMAGE;

  // Build JSON-LD Schema
  const jsonLdGraph: any[] = [];

  // 1. Organization Schema
  jsonLdGraph.push({
    "@type": "Organization",
    "@id": `${BASE_URL}/#organization`,
    "name": "Executive Talks Media Business Intelligence",
    "alternateName": ["Executive Talks Media", "Executive Talks"],
    "url": BASE_URL,
    "logo": `${BASE_URL}/logo-official.png`,
    "image": DEFAULT_IMAGE,
    "description": "Executive Talks Media Business Intelligence curates India's premier C-suite conferences, leadership summits, and Executive Talks Magazine.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Unit No-1012, 10th Floor, Manjeera Trinity Corporate, JNTU-Hitech Road, KPHB",
      "addressLocality": "Hyderabad",
      "addressRegion": "Telangana",
      "postalCode": "500072",
      "addressCountry": "IN"
    },
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+91-9100266777",
        "contactType": "customer service",
        "email": "info@executivetalksmedia.in",
        "areaServed": "IN"
      },
      {
        "@type": "ContactPoint",
        "telephone": "+91-9493087788",
        "contactType": "event registrations",
        "email": "registration@executivetalksmedia.in",
        "areaServed": "IN"
      }
    ],
    "sameAs": [
      "https://www.linkedin.com/company/executive-talks-media",
      "https://twitter.com/ExecutiveTalksMedia",
      "https://www.youtube.com/@ExecutiveTalksMedia",
      "https://www.instagram.com/executivetalksmedia"
    ]
  });

  // 2. WebSite Schema with SearchAction
  jsonLdGraph.push({
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    "url": BASE_URL,
    "name": "Executive Talks Media Business Intelligence",
    "publisher": {
      "@id": `${BASE_URL}/#organization`
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${BASE_URL}/events?search={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  });

  // 3. Event Schema (if eventData provided)
  if (eventData) {
    const eventSchema: any = {
      "@type": "Event",
      "name": eventData.name,
      "description": eventData.description || `${eventData.name} organized by Executive Talks Media Business Intelligence.`,
      "image": eventData.image || metaImage,
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "eventStatus": "https://schema.org/EventScheduled",
      "organizer": {
        "@type": "Organization",
        "name": "Executive Talks Media Business Intelligence",
        "url": BASE_URL
      },
      "location": {
        "@type": "Place",
        "name": eventData.locationName || `${eventData.city || "Hyderabad"} Convention Center`,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": eventData.city || "Hyderabad",
          "addressCountry": "IN"
        }
      }
    };

    if (eventData.startDate) {
      eventSchema.startDate = eventData.startDate;
    }
    if (eventData.endDate) {
      eventSchema.endDate = eventData.endDate;
    }
    if (eventData.isFree) {
      eventSchema.offers = {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock",
        "url": eventData.url || canonicalUrl,
        "validFrom": new Date().toISOString().split("T")[0]
      };
    } else if (eventData.price) {
      eventSchema.offers = {
        "@type": "Offer",
        "price": String(eventData.price).replace(/[^0-9.]/g, ""),
        "priceCurrency": eventData.currency || "INR",
        "availability": "https://schema.org/InStock",
        "url": eventData.url || canonicalUrl,
        "validFrom": new Date().toISOString().split("T")[0]
      };
    }

    jsonLdGraph.push(eventSchema);
  }

  // 4. Custom Structured Data
  if (structuredData) {
    if (Array.isArray(structuredData)) {
      jsonLdGraph.push(...structuredData);
    } else {
      jsonLdGraph.push(structuredData);
    }
  }

  const structuredDataJson = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": jsonLdGraph
  });

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={fullKeywords} />
      <meta name="author" content={author} />
      <meta name="publisher" content="Executive Talks Media Business Intelligence" />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <link rel="canonical" href={canonicalUrl} />

      {/* OpenGraph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Executive Talks Media Business Intelligence" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@ExecutiveTalksMedia" />
      <meta name="twitter:creator" content="@ExecutiveTalksMedia" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {/* Structured Data JSON-LD */}
      <script type="application/ld+json">{structuredDataJson}</script>
    </Helmet>
  );
};

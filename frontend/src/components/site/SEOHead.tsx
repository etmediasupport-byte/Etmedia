import React from "react";
import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = "ET Media Business Intelligence | India's Premier CXO Summit Platform",
  description = "ET Media Business Intelligence curates premier C-suite conferences, national leadership forums, Executive Talks Magazine, and corporate awards across India.",
  keywords = "ET Media, CFO Summit, HR Awards, Enterprise AI Conclave, CXO Conferences, Executive Networking, Business Intelligence India",
  image = "https://www.etmedia.in/assets/hero-summit-ClCGVqfO.jpg",
  url = "https://www.etmedia.in",
  type = "website",
  author = "ET Media Business Intelligence",
}) => {
  const fullTitle = title.includes("ET Media") ? title : `${title} | ET Media Business Intelligence`;

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <link rel="canonical" href={url} />

      {/* OpenGraph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="ET Media Business Intelligence" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@ETMediaHub" />
      <meta name="twitter:creator" content="@ETMediaHub" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

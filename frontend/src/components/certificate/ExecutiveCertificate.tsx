import React, { useMemo } from "react";
import certificateFrameBg from "@/assets/certificate-frame-bg.png";

export interface ExecutiveCertificateProps {
  candidateName?: string;
  organization?: string;
  designation?: string;
  headerTitle?: string;
  headerSubtitle?: string;
  presentedToText?: string;
  eventTitle?: string;
  eventDate?: string;
  eventVenue?: string;
  dateVenueText?: string;
  city?: string;
  bodyLine1?: string;
  bodyLine2?: string;
  signatoryHeader?: string;
  signatoryName?: string;
  signatoryOrg?: string;
  certId?: string;
  issueDate?: string;
  className?: string;
  showIdBadge?: boolean;
}

export const ExecutiveCertificate: React.FC<ExecutiveCertificateProps> = ({
  candidateName = "Executive Delegate",
  organization = "",
  designation = "",
  headerTitle = "CERTIFICATE",
  headerSubtitle = "OF APPRECIATION",
  presentedToText = "This certificate is Presented to",
  eventTitle = "PROCUREMENT LEADERSHIP SUMMIT & EXCELLENCE AWARDS 2026",
  eventDate = "2026-06-19",
  eventVenue = "Radisson Hotel, Hyderabad",
  dateVenueText,
  city = "Hyderabad",
  bodyLine1,
  bodyLine2,
  signatoryHeader = "Presented By:",
  signatoryName = "Srikanth",
  signatoryOrg = "Executive Talks Media",
  certId,
  className = "",
  showIdBadge = false,
}) => {
  // Format venue line: e.g. "2026-06-19 | Radisson Hotel, Hyderabad"
  const formattedMeta = useMemo(() => {
    if (dateVenueText && dateVenueText.trim()) return dateVenueText.trim();
    const venuePart = eventVenue || (city ? `${city}, India` : "Hyderabad, India");
    const datePart = eventDate || "11th December 2026";
    return `${datePart} | ${venuePart}`;
  }, [dateVenueText, eventDate, eventVenue, city]);

  const displayTitle = eventTitle && eventTitle.trim() ? eventTitle.trim() : "Executive Leadership Summit 2026";
  const displayCandidate = candidateName && candidateName.trim() ? candidateName.trim().toUpperCase() : "EXECUTIVE DELEGATE";
  const displayOrganization = organization && organization.trim()
    ? organization.trim()
    : (designation && designation.trim() ? designation.trim() : "");

  // Dynamic recognition body lines
  const displayBodyLine1 = bodyLine1 && bodyLine1.trim()
    ? bodyLine1.trim()
    : "In recognition of your valuable participation as an esteemed";
  
  const displayBodyLine2 = bodyLine2 && bodyLine2.trim()
    ? bodyLine2.trim()
    : `Delegate at the ${displayTitle}.`;

  // Dynamic font sizing for long titles, names & organization to avoid clipping
  const titleFontSize = displayTitle.length > 55 ? 15.5 : displayTitle.length > 38 ? 17.5 : 20;
  const nameFontSize = displayCandidate.length > 32 ? 22 : displayCandidate.length > 20 ? 25 : 28;
  const orgFontSize = displayOrganization.length > 45 ? 13 : displayOrganization.length > 28 ? 15 : 17;

  return (
    <div className={`w-full max-w-[1024px] mx-auto select-none ${className}`}>
      {/* 
        Fixed A4 Landscape Ratio (1024 x 723).
        SVG ViewBox guarantees 100% IDENTICAL layout and scaling across all devices.
      */}
      <div className="relative w-full aspect-[1024/723] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden bg-white border border-slate-200">
        <svg
          viewBox="0 0 1024 723"
          className="w-full h-full block"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <style>
              {`
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800;900&family=Montserrat:ital,wght@0,500;0,600;0,700;0,800;0,900;1,500&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&display=swap');
                .cert-heading {
                  font-family: 'Cinzel', 'Playfair Display', Georgia, serif;
                  font-weight: 900;
                  letter-spacing: 5px;
                  fill: #111827;
                }
                .cert-subheading {
                  font-family: 'Montserrat', Inter, sans-serif;
                  font-weight: 700;
                  letter-spacing: 4px;
                  fill: #1f2937;
                }
                .cert-event-title {
                  font-family: 'Montserrat', Inter, sans-serif;
                  font-weight: 800;
                  fill: #0f172a;
                }
                .cert-event-meta {
                  font-family: 'Montserrat', Inter, sans-serif;
                  font-weight: 600;
                  fill: #475569;
                }
                .cert-present-to {
                  font-family: 'Montserrat', Inter, sans-serif;
                  font-weight: 800;
                  fill: #0f172a;
                }
                .cert-name {
                  font-family: 'Cinzel', 'Playfair Display', Georgia, serif;
                  font-weight: 800;
                  letter-spacing: 1.5px;
                  fill: #0f172a;
                }
                .cert-company {
                  font-family: 'Montserrat', Inter, sans-serif;
                  font-weight: 700;
                  fill: #334155;
                  letter-spacing: 0.5px;
                }
                .cert-body {
                  font-family: 'Montserrat', Inter, sans-serif;
                  font-weight: 500;
                  fill: #1e293b;
                }
                .cert-signatory-hdr {
                  font-family: 'Montserrat', Inter, sans-serif;
                  font-weight: 700;
                  fill: #0f172a;
                }
                .cert-signatory-org {
                  font-family: 'Montserrat', Inter, sans-serif;
                  font-weight: 800;
                  fill: #0f172a;
                }
              `}
            </style>
          </defs>

          {/* 1. AUTHENTIC HIGH-RESOLUTION FRAME BACKGROUND */}
          <image
            href={certificateFrameBg}
            x="0"
            y="0"
            width="1024"
            height="723"
            preserveAspectRatio="none"
          />

          {/* 2. HEADER: CERTIFICATE OF APPRECIATION */}
          <text x="284" y="136" className="cert-heading" fontSize="40">
            {headerTitle}
          </text>
          <text x="285" y="171" className="cert-subheading" fontSize="18.5">
            {headerSubtitle}
          </text>

          {/* 3. DYNAMIC EVENT NAME & DETAILS */}
          <text
            x="285"
            y="226"
            className="cert-event-title"
            fontSize={titleFontSize}
          >
            {displayTitle}
          </text>
          <text x="285" y="252" className="cert-event-meta" fontSize="13.5">
            {formattedMeta}
          </text>

          {/* 4. PRESENTED TO HEADER */}
          <text x="285" y="344" className="cert-present-to" fontSize="17.5">
            {presentedToText}
          </text>

          {/* 5. CANDIDATE NAME SITTING EXACTLY ABOVE THE GOLD LINE */}
          <text
            x="285"
            y="404"
            className="cert-name"
            fontSize={nameFontSize}
          >
            {displayCandidate}
          </text>

          {/* 6. GOLD UNDERLINE ACCENT */}
          <line
            x1="285"
            y1="418"
            x2="775"
            y2="418"
            stroke="#c89e34"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* 6b. COMPANY NAME SITTING EXACTLY BELOW THE GOLD LINE */}
          {displayOrganization && (
            <text
              x="285"
              y="446"
              className="cert-company"
              fontSize={orgFontSize}
            >
              {displayOrganization}
            </text>
          )}

          {/* 7. APPRECIATION / RECOGNITION PARAGRAPHS */}
          <text x="285" y="495" className="cert-body" fontSize="14">
            {displayBodyLine1}
          </text>
          <text x="285" y="521" className="cert-body" fontSize="14">
            {displayBodyLine2}
          </text>

          {/* Optional Certificate ID Stamp in top-right area */}
          {showIdBadge && certId && (
            <text
              x="970"
              y="20"
              textAnchor="end"
              fontFamily="monospace"
              fontSize="10"
              fontWeight="bold"
              fill="#94a3b8"
            >
              ID: {certId}
            </text>
          )}
        </svg>
      </div>
    </div>
  );
};

export default ExecutiveCertificate;

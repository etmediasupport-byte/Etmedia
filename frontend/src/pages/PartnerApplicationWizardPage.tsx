import React from "react";
import { MultiStepFormWizard, WizardStepConfig } from "@/components/site/MultiStepFormWizard";

const partnerSteps: WizardStepConfig[] = [
  {
    // Step 1
    fields: [
      {
        name: "company_name",
        label: "Company / Organization Name",
        type: "text",
        placeholder: "e.g. Acme Enterprises Pvt Ltd",
        required: true,
        colSpan: 1,
      },
      {
        name: "website",
        label: "Company Website URL",
        type: "url",
        placeholder: "https://acme.com",
        required: false,
        colSpan: 1,
      },
      {
        name: "industry",
        label: "Industry Sector",
        type: "select",
        options: [
          "Finance & Banking (BFSI)",
          "IT & Enterprise Software",
          "Healthcare & Life Sciences",
          "E-Commerce & Retail",
          "Manufacturing & Engineering",
          "Human Resources & Talent Management",
          "Energy & Sustainability",
          "Real Estate & Infrastructure",
          "Media & Telecom",
          "Consulting & Professional Services",
          "Other Industry",
        ],
        required: true,
        colSpan: 1,
      },
      {
        name: "location",
        label: "Headquarters / Location",
        type: "text",
        placeholder: "e.g. Hyderabad, India",
        required: true,
        colSpan: 1,
      },
    ],
  },
  {
    // Step 2
    fields: [
      {
        name: "contact_person",
        label: "Primary Contact Person Name",
        type: "text",
        placeholder: "e.g. Rajesh Sharma",
        required: true,
        colSpan: 1,
      },
      {
        name: "designation",
        label: "Official Designation",
        type: "text",
        placeholder: "e.g. Vice President - Marketing",
        required: true,
        colSpan: 1,
      },
      {
        name: "email",
        label: "Official Work Email Address",
        type: "email",
        placeholder: "rajesh@acme.com",
        required: true,
        colSpan: 1,
      },
      {
        name: "phone",
        label: "Mobile / Phone Number",
        type: "tel",
        placeholder: "+91 98765 43210",
        required: true,
        colSpan: 1,
      },
    ],
  },
  {
    // Step 3
    fields: [
      {
        name: "partnership_type",
        label: "Partnership & Sponsorship Type",
        type: "select",
        options: [
          "Branding Partnership",
          "Sponsorship Tier (Title / Platinum / Gold)",
          "Speaking & Keynote Slot",
          "Product Launch Stage",
          "Awards Co-Presenting",
          "PR & Media Campaign",
          "Strategic Alliance / Ecosystem Partner",
          "Other Partnership Enquiry",
        ],
        required: true,
        colSpan: 2,
      },
      {
        name: "message",
        label: "Proposal & Strategic Objectives",
        type: "textarea",
        placeholder: "Briefly describe your vision for partnering with Executive Talks Media...",
        required: false,
        colSpan: 2,
      },
    ],
  },
];

export default function PartnerApplicationWizardPage() {
  const handleComplete = async (formData: Record<string, string>) => {
    const res = await fetch("/api/partners/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return {
        success: true,
        message: "Your partnership application has been submitted to the Executive Talks Media partnerships team.",
      };
    } else {
      return {
        success: false,
        message: data.message || "Failed to submit partnership application.",
      };
    }
  };

  return (
    <MultiStepFormWizard
      storageKey="partner_application"
      badgeText="PARTNERSHIP APPLICATION"
      title="Partner With Executive Talks Media"
      subtitle="Complete your step-by-step application to showcase your brand at executive summits."
      steps={partnerSteps}
      onComplete={handleComplete}
      successTitle="Partnership Proposal Submitted!"
      successSubtitle="Our partnerships team will evaluate your application and reach out within 24-48 business hours."
      cancelPath="/partner"
    />
  );
}

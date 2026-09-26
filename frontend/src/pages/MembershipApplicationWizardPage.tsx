import React from "react";
import { MultiStepFormWizard, WizardStepConfig } from "@/components/site/MultiStepFormWizard";

const membershipSteps: WizardStepConfig[] = [
  {
    // Step 1
    fields: [
      {
        name: "fullName",
        label: "Delegate Full Name",
        type: "text",
        placeholder: "e.g. Vikramaditya Rao",
        required: true,
        colSpan: 1,
      },
      {
        name: "designation",
        label: "Official Designation",
        type: "text",
        placeholder: "e.g. Chief Human Resources Officer",
        required: true,
        colSpan: 1,
      },
      {
        name: "organization",
        label: "Organisation / Company",
        type: "text",
        placeholder: "e.g. Apex Global Tech",
        required: true,
        colSpan: 1,
      },
      {
        name: "officialEmail",
        label: "Official Work Email",
        type: "email",
        placeholder: "vikram@apextech.com",
        required: true,
        colSpan: 1,
      },
    ],
  },
  {
    // Step 2
    fields: [
      {
        name: "mobileNumber",
        label: "Mobile / WhatsApp Number",
        type: "tel",
        placeholder: "+91 98765 43210",
        required: true,
        colSpan: 1,
      },
      {
        name: "city",
        label: "City / State",
        type: "text",
        placeholder: "e.g. Hyderabad, Telangana",
        required: true,
        colSpan: 1,
      },
      {
        name: "linkedinUrl",
        label: "LinkedIn Profile URL",
        type: "url",
        placeholder: "https://linkedin.com/in/vikram",
        required: false,
        colSpan: 2,
      },
    ],
  },
  {
    // Step 3
    fields: [
      {
        name: "companyName",
        label: "Corporate Legal Entity Name",
        type: "text",
        placeholder: "e.g. Apex Global Tech Solutions Ltd",
        required: true,
        colSpan: 1,
      },
      {
        name: "industry",
        label: "Industry Sector",
        type: "select",
        options: [
          "Technology & IT",
          "Finance, Banking & Fintech",
          "Healthcare, Pharma & Biotech",
          "Manufacturing & Automotive",
          "Retail & E-Commerce",
          "Logistics & Supply Chain",
          "Energy, Utilities & Infrastructure",
          "Real Estate & Construction",
          "Media, Entertainment & Telecom",
          "Consulting & Professional Services",
          "Education & Research",
          "Government & Public Sector",
          "Other Industry",
        ],
        required: true,
        colSpan: 1,
      },
      {
        name: "location",
        label: "Corporate HQ Location",
        type: "text",
        placeholder: "e.g. Hitec City, Hyderabad",
        required: true,
        colSpan: 1,
      },
      {
        name: "gstNumber",
        label: "GST Number (Optional)",
        type: "text",
        placeholder: "36AAAAA0000A1Z5",
        required: false,
        colSpan: 1,
      },
    ],
  },
  {
    // Step 4
    fields: [
      {
        name: "contactPersonName",
        label: "Primary Point of Contact Name",
        type: "text",
        placeholder: "e.g. Sunita Reddy",
        required: true,
        colSpan: 1,
      },
      {
        name: "contactPersonDesignation",
        label: "Contact Person Designation",
        type: "text",
        placeholder: "e.g. Executive Assistant / HR Lead",
        required: true,
        colSpan: 1,
      },
      {
        name: "contactPersonEmail",
        label: "Contact Person Email",
        type: "email",
        placeholder: "sunita@apextech.com",
        required: true,
        colSpan: 1,
      },
      {
        name: "contactPersonPhone",
        label: "Contact Person Direct Phone",
        type: "tel",
        placeholder: "+91 98765 43211",
        required: true,
        colSpan: 1,
      },
    ],
  },
];

export default function MembershipApplicationWizardPage() {
  const handleComplete = async (formData: Record<string, string>) => {
    const res = await fetch("/api/delegate-registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return {
        success: true,
        message: "Your Executive Membership Delegate Application has been submitted to Executive Talks Media.",
      };
    } else {
      return {
        success: false,
        message: data.message || "Failed to submit membership registration.",
      };
    }
  };

  return (
    <MultiStepFormWizard
      storageKey="membership_delegate_app"
      badgeText="EXECUTIVE MEMBERSHIP APPLICATION"
      title="Join Executive Membership Council"
      subtitle="Complete your step-by-step application for VIP access to leadership summits and exclusive network sessions."
      steps={membershipSteps}
      onComplete={handleComplete}
      successTitle="Delegate Application Submitted!"
      successSubtitle="Our executive committee will review your application and issue membership accreditation shortly."
      cancelPath="/membership"
    />
  );
}

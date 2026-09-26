import React from "react";
import { MultiStepFormWizard, WizardStepConfig } from "@/components/site/MultiStepFormWizard";

const contactSteps: WizardStepConfig[] = [
  {
    // Step 1
    fields: [
      {
        name: "name",
        label: "Your Full Name",
        type: "text",
        placeholder: "e.g. Anil Kumar",
        required: true,
        colSpan: 1,
      },
      {
        name: "email",
        label: "Work Email Address",
        type: "email",
        placeholder: "anil@company.com",
        required: true,
        colSpan: 1,
      },
      {
        name: "phone",
        label: "Mobile / Phone Number",
        type: "tel",
        placeholder: "+91 98765 43210",
        required: true,
        colSpan: 2,
      },
    ],
  },
  {
    // Step 2
    fields: [
      {
        name: "enquiryType",
        label: "Enquiry Category / Topic",
        type: "select",
        options: [
          "Event Registration & Delegate Passes",
          "Sponsorship & Branding Partnerships",
          "Speaking & Advisory Opportunities",
          "Media Coverage & Magazine Press",
          "Careers & Talent Opportunities",
          "General Advisory Enquiry",
        ],
        required: true,
        colSpan: 1,
      },
      {
        name: "organization",
        label: "Organization & Designation",
        type: "text",
        placeholder: "e.g. Director, Tech Global",
        required: false,
        colSpan: 1,
      },
    ],
  },
  {
    // Step 3
    fields: [
      {
        name: "message",
        label: "Detailed Message / Requirements",
        type: "textarea",
        placeholder: "Provide details about your query or how Executive Talks Media can assist you...",
        required: true,
        colSpan: 2,
      },
    ],
  },
];

export default function ContactFormWizardPage() {
  const handleComplete = async (formData: Record<string, string>) => {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return {
        success: true,
        message: "Your message has been dispatched to Executive Talks Media helpdesk.",
      };
    } else {
      return {
        success: false,
        message: data.message || "Failed to submit contact enquiry.",
      };
    }
  };

  return (
    <MultiStepFormWizard
      storageKey="contact_enquiry"
      badgeText="EXECUTIVE TALKS MEDIA ENQUIRY"
      title="Contact Advisory Desk"
      subtitle="Complete your multi-step enquiry to connect with our summit directors and media team."
      steps={contactSteps}
      onComplete={handleComplete}
      successTitle="Enquiry Received!"
      successSubtitle="Thank you for contacting Executive Talks Media. Our support executive will respond to your email promptly."
      cancelPath="/contact"
    />
  );
}

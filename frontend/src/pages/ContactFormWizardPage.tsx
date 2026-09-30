import React from "react";
import { MultiStepFormWizard, WizardStepConfig } from "@/components/site/MultiStepFormWizard";
import { SEOHead } from "@/components/site/SEOHead";

const contactSteps: WizardStepConfig[] = [
  {
    // Step 1: Personal & Contact
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
    // Step 2: Professional & Topic
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
        colSpan: 2,
      },
      {
        name: "organization",
        label: "Company / Organization Name",
        type: "text",
        placeholder: "e.g. Tech Global Solutions Ltd",
        required: true,
        colSpan: 1,
      },
      {
        name: "designation",
        label: "Official Designation",
        type: "text",
        placeholder: "e.g. Vice President / Marketing Director",
        required: true,
        colSpan: 1,
      },
    ],
  },
  {
    // Step 3: Message / Inquiry
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
    <>
      <SEOHead
        title="Contact Form Wizard | Executive Talks Media"
        description="Submit your enquiry to Executive Talks Media Business Intelligence executive advisory desk."
        keywords="Contact Form, Enquiry, Executive Talks Media, ET Media"
        url="https://www.executivetalksmedia.in/contact/form"
      />
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
    </>
  );
}

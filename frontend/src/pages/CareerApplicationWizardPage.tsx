import React from "react";
import { useSearchParams } from "react-router-dom";
import { MultiStepFormWizard, WizardField, WizardStepConfig } from "@/components/site/MultiStepFormWizard";

const careerSteps: WizardStepConfig[] = [
  {
    // Step 1
    fields: [
      {
        name: "name",
        label: "Full Name",
        type: "text",
        placeholder: "e.g. Priya Ananth",
        required: true,
        colSpan: 1,
      },
      {
        name: "email",
        label: "Email Address",
        type: "email",
        placeholder: "priya@example.com",
        required: true,
        colSpan: 1,
      },
      {
        name: "phone",
        label: "Mobile Number",
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
        name: "experience",
        label: "Total Years of Relevant Experience",
        type: "select",
        options: [
          "0-1 Year (Fresh Graduate / Junior)",
          "1-3 Years",
          "3-5 Years",
          "5-8 Years (Senior)",
          "8+ Years (Lead / Executive)",
        ],
        required: true,
        colSpan: 1,
      },
      {
        name: "portfolio_url",
        label: "Portfolio / LinkedIn Profile URL",
        type: "url",
        placeholder: "https://linkedin.com/in/priya",
        required: false,
        colSpan: 1,
      },
    ],
  },
  {
    // Step 3
    fields: [
      {
        name: "resume_url",
        label: "Upload Resume (PDF)",
        type: "file",
        required: true,
        colSpan: 2,
        helpText: "Upload a PDF document detailing your work experience and achievements.",
      },
    ],
  },
];

export default function CareerApplicationWizardPage() {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId") || "GENERAL";
  const jobTitle = searchParams.get("title") || "General Career Application";

  const handleFileUpload = async (field: WizardField, file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return { success: false, error: "Please upload a valid PDF file for your resume." };
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const res = await fetch("/api/upload-resume", {
        method: "POST",
        headers: { "Content-Type": "application/octet-stream" },
        body: arrayBuffer,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, url: data.url };
      } else {
        return { success: false, error: data.message || "Failed to upload resume PDF." };
      }
    } catch (e) {
      return { success: false, error: "Network error uploading file." };
    }
  };

  const handleComplete = async (formData: Record<string, string>) => {
    const res = await fetch("/api/jobs/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        job_id: jobId,
        job_title: jobTitle,
        ...formData,
      }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return {
        success: true,
        message: `Your application for "${jobTitle}" has been received by Executive Talks Media HR.`,
      };
    } else {
      return {
        success: false,
        message: data.message || "Failed to submit job application.",
      };
    }
  };

  return (
    <MultiStepFormWizard
      storageKey={`career_app_${jobId}`}
      badgeText="CAREERS APPLICATION"
      title={`Apply for ${jobTitle}`}
      subtitle="Complete your multi-step job application for Executive Talks Media."
      steps={careerSteps}
      onComplete={handleComplete}
      customFileUploadHandler={handleFileUpload}
      successTitle="Job Application Submitted!"
      successSubtitle="Our talent acquisition team will review your resume and reach out if your profile matches the role."
      cancelPath="/careers"
    />
  );
}

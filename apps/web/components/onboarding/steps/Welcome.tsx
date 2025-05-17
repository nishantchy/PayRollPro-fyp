import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface WelcomeProps {
  nextStep: () => void;
}

export function Welcome({ nextStep }: WelcomeProps) {
  return (
    <div className="flex flex-col items-center text-center max-w-2xl mx-auto py-6">
      <div className="mb-8">
        <Image
          src="/onboarding/welcome.svg"
          alt="Welcome to PayrollPro"
          width={300}
          height={300}
          className="mx-auto"
          // Fallback image if the SVG doesn't exist
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = "https://placehold.co/300x300?text=Welcome";
          }}
        />
      </div>

      <h2 className="text-3xl font-bold mb-4">Welcome to PayrollPro!</h2>

      <p className="text-lg text-muted-foreground mb-6">
        We're excited to have you on board. Let's set up your organization to
        get you started. This should only take a few minutes.
      </p>

      <div className="space-y-4 text-left max-w-md w-full">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 p-2 rounded-full text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 4v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.342a2 2 0 0 0-.602-1.43l-4.44-4.342A2 2 0 0 0 13.56 2H6a2 2 0 0 0-2 2z" />
              <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium">Organization Information</h3>
            <p className="text-sm text-muted-foreground">
              Basic details about your organization
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="bg-primary/10 p-2 rounded-full text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium">Logo Upload</h3>
            <p className="text-sm text-muted-foreground">
              Give your organization a visual identity
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="bg-primary/10 p-2 rounded-full text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium">Finalize Setup</h3>
            <p className="text-sm text-muted-foreground">
              Review and complete your organization setup
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <Button onClick={nextStep} size="lg">
          Let's Get Started
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ml-2"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Button>
      </div>
    </div>
  );
}

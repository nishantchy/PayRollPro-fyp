"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/api/store/auth.store";
import { Welcome } from "@/components/onboarding/steps/Welcome";
import { OrgInfo } from "@/components/onboarding/steps/OrgInfo";
import { OrgLogo } from "@/components/onboarding/steps/OrgLogo";
import { Review } from "@/components/onboarding/steps/Review";
import { Congratulations } from "@/components/onboarding/steps/Congratulations";
import { OrganizationStepper } from "@/components/onboarding/OrganizationStepper";

// Define the steps in the onboarding process
const steps = ["welcome", "info", "logo", "review", "congrats"];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated and if they already have an organization
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // If the user already has completed onboarding, redirect to dashboard
    if (user?.hasOnboarded) {
      router.push("/dashboard");
      return;
    }

    // If the user already has an organization but hasn't completed onboarding,
    // we'll still show the onboarding process
    setLoading(false);
  }, [isAuthenticated, user, router]);

  // Handle navigation between steps
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  };

  // Get the current component based on step
  const renderCurrentStep = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-96">Loading...</div>
      );
    }

    switch (steps[currentStep]) {
      case "welcome":
        return <Welcome nextStep={nextStep} />;
      case "info":
        return <OrgInfo nextStep={nextStep} prevStep={prevStep} />;
      case "logo":
        return <OrgLogo nextStep={nextStep} prevStep={prevStep} />;
      case "review":
        return (
          <Review nextStep={nextStep} prevStep={prevStep} goToStep={goToStep} />
        );
      case "congrats":
        return <Congratulations />;
      default:
        return <Welcome nextStep={nextStep} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-10 px-4 max-w-5xl">
        {!loading && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-lg md:text-4xl font-bold">
                Organization Setup
              </h1>
              <div className="text-sm md:text-lg text-muted-foreground">
                Step {currentStep + 1} of {steps.length}
              </div>
            </div>

            {/* Replace progress bar with stepper component */}
            <OrganizationStepper
              currentStep={currentStep}
              steps={steps}
              goToStep={goToStep}
            />
          </div>
        )}

        {/* Current step component */}
        <div className="bg-card rounded-lg border shadow-sm p-6">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
}

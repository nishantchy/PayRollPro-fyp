import React from "react";
import { cn } from "@/lib/utils";

interface OrganizationStepperProps {
  currentStep: number;
  steps: string[];
  goToStep?: (step: number) => void;
  className?: string;
}

export function OrganizationStepper({
  currentStep,
  steps,
  goToStep,
  className,
}: OrganizationStepperProps) {
  // Convert step names to title case and make them more readable
  const formatStepName = (name: string) => {
    switch (name.toLowerCase()) {
      case "welcome":
        return "Welcome";
      case "info":
        return "Organization Info";
      case "logo":
        return "Logo";
      case "review":
        return "Review";
      case "congrats":
        return "Complete";
      default:
        return name.charAt(0).toUpperCase() + name.slice(1);
    }
  };

  return (
    <div className={cn("w-full mb-8", className)}>
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const isClickable = goToStep && index < currentStep;

          return (
            <React.Fragment key={step}>
              {/* Step circle */}
              <div
                className={cn(
                  "relative flex items-center justify-center w-12 h-12 rounded-full text-xs font-semibold transition-all shadow-xl border",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isCompleted
                      ? "bg-primary/80 text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  isClickable && "cursor-pointer hover:bg-primary/90"
                )}
                onClick={() => {
                  if (isClickable && goToStep) {
                    goToStep(index);
                  }
                }}
                aria-label={`Step ${index + 1}: ${formatStepName(step)}`}
                role={isClickable ? "button" : "presentation"}
              >
                {isCompleted ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-current"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ) : (
                  index + 1
                )}

                {/* Step label */}
                <span
                  className={cn(
                    "absolute whitespace-nowrap text-xs font-medium -bottom-7",
                    isActive
                      ? "text-foreground"
                      : isCompleted
                        ? "text-muted-foreground"
                        : "text-muted-foreground/70"
                  )}
                >
                  {formatStepName(step)}
                </span>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 max-w-24 transition-all",
                    isCompleted
                      ? "bg-primary/80"
                      : index === currentStep - 1
                        ? "bg-gradient-to-r from-primary/80 to-muted"
                        : "bg-muted"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

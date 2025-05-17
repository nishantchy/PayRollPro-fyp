import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface OrgLogoProps {
  nextStep: () => void;
  prevStep: () => void;
}

// Storage key for logo file data
const STORAGE_KEY = "onboarding_org_logo";

export function OrgLogo({ nextStep, prevStep }: OrgLogoProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved logo from sessionStorage on component mount
  useEffect(() => {
    const savedLogo = sessionStorage.getItem(STORAGE_KEY);
    if (savedLogo) {
      setPreviewUrl(savedLogo);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const file = e.target.files[0];
      if (file && file.type.startsWith("image/")) {
        processFile(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files?.length) {
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        processFile(file);
      }
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);

      // Save to sessionStorage
      sessionStorage.setItem(STORAGE_KEY, result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setPreviewUrl(null);
    sessionStorage.removeItem(STORAGE_KEY);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleContinue = () => {
    nextStep();
  };

  return (
    <div className="max-w-3xl mx-auto py-4">
      <h2 className="text-2xl font-bold mb-6">Organization Logo</h2>

      <p className="text-muted-foreground mb-8">
        Upload your organization's logo. This will be displayed on your
        dashboard and documents.
      </p>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
        <div className="w-full md:w-1/2">
          {previewUrl ? (
            <div className="flex flex-col items-center">
              <div className="relative w-48 h-48 mb-4 border rounded-lg overflow-hidden">
                <Image
                  src={previewUrl}
                  alt="Organization Logo Preview"
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={triggerFileInput}
                >
                  Change Logo
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveLogo}
                >
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging ? "border-primary bg-primary/5" : "border-gray-300"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted-foreground mb-4"
                >
                  <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
                  <path d="M12 12v9"></path>
                  <path d="m16 16-4-4-4 4"></path>
                </svg>
                <h3 className="text-lg font-medium mb-2">
                  Drag & Drop Your Logo Here
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Supports JPG, PNG, or GIF (Max 5MB)
                </p>
                <Button type="button" onClick={triggerFileInput}>
                  Choose File
                </Button>
              </div>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        <div className="w-full md:w-1/2">
          <div className="bg-muted/30 rounded-lg p-6">
            <h3 className="text-lg font-medium mb-3">Logo Guidelines:</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary flex-shrink-0 mt-0.5"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span>File format: JPG, PNG, or GIF</span>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary flex-shrink-0 mt-0.5"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span>Maximum file size: 5MB</span>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary flex-shrink-0 mt-0.5"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span>Recommended dimensions: Square (1:1 ratio)</span>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary flex-shrink-0 mt-0.5"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span>Background should be transparent or solid color</span>
              </li>
            </ul>
            <div className="mt-6 text-sm text-muted-foreground">
              <p className="font-medium">Note:</p>
              <p>
                This step is optional. You can skip it if you don't have a logo
                yet.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={prevStep}>
          Back
        </Button>
        <div className="space-x-2">
          <Button type="button" variant="outline" onClick={handleContinue}>
            {previewUrl ? "Continue" : "Skip for now"}
          </Button>
        </div>
      </div>
    </div>
  );
}

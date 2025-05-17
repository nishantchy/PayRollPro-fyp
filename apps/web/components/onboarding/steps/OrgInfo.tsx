import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Define the form schema with validation
const formSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
  industry: z.string().optional(),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Please enter a valid email").optional(),
  website: z.string().url("Please enter a valid URL").optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  signatory_name: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface OrgInfoProps {
  nextStep: () => void;
  prevStep: () => void;
}

// Storage key for organization info
const STORAGE_KEY = "onboarding_org_info";

export function OrgInfo({ nextStep, prevStep }: OrgInfoProps) {
  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      industry: "",
      description: "",
      phone: "",
      email: "",
      website: "",
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
      },
      signatory_name: "",
    },
  });

  // Load saved data from sessionStorage on component mount
  useEffect(() => {
    const savedData = sessionStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      form.reset(parsedData);
    }
  }, [form]);

  // Handle form submission
  const onSubmit = (values: FormValues) => {
    // Save the form data to sessionStorage
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(values));
    nextStep();
  };

  return (
    <div className="max-w-3xl mx-auto py-4">
      <h2 className="text-2xl font-bold mb-6">Organization Information</h2>

      <p className="text-muted-foreground mb-8">
        Please provide details about your organization. Fields marked with{" "}
        <span className="text-red-500">*</span> are required.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Organization Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter organization name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter industry (e.g. Technology, Healthcare)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Brief description of your organization"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="organization@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+1-234-567-8900" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Address Details</h3>
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="address.street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="address.state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Province</FormLabel>
                    <FormControl>
                      <Input placeholder="State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address.zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zip/Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address.country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="signatory_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Signatory Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Name of authorized signatory"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between pt-6">
            <Button type="button" variant="outline" onClick={prevStep}>
              Back
            </Button>
            <Button type="submit">Continue</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

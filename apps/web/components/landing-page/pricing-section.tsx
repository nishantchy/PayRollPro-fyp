"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Check, X } from "lucide-react";
import Link from "next/link";

const PricingSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 },
    },
  };

  const plans = [
    {
      id: "free",
      name: "Free Plan",
      description: "Basic features for small teams getting started",
      price: 0,
      planType: "lifetime",
      features: {
        maxOrganizations: 1,
        maxUsersPerOrg: 5,
        prioritySupport: false,
        additionalFeatures: [
          "Basic payroll processing",
          "Employee self-service portal",
          "Standard reports",
          "Email support",
        ],
      },
      isPopular: false,
      buttonText: "Start Free",
      buttonColor: "bg-primary hover:bg-primary/80",
    },
    {
      id: "basic",
      name: "Basic Plan",
      description: "Essential features for growing teams",
      price: 50000, // NPR pricing
      planType: "lifetime",
      features: {
        maxOrganizations: 3,
        maxUsersPerOrg: 20,
        prioritySupport: true,
        additionalFeatures: [
          "All Free Plan features",
          "Advanced reporting",
          "Tax filing assistance",
          "Direct deposit",
          "Priority email support",
        ],
      },
      isPopular: true,
      buttonText: "Start Basic",
      buttonColor: "bg-primary hover:bg-primary/80",
    },
    {
      id: "pro",
      name: "Pro Plan",
      description: "Advanced features for professional teams",
      price: 100000, // NPR pricing
      planType: "lifetime",
      features: {
        maxOrganizations: -1, // -1 for unlimited
        maxUsersPerOrg: -1, // -1 for unlimited
        prioritySupport: true,
        additionalFeatures: [
          "All Basic Plan features",
          "Unlimited organizations",
          "Unlimited users",
          "24/7 phone & email support",
        ],
      },
      isPopular: false,
      buttonText: "Start Pro",
      buttonColor: "bg-primary hover:bg-primary/80",
    },
  ];

  // Helper function to format price
  const formatPrice = (price: number): string => {
    if (price === 0) return "Free";
    return `NPR ${price.toLocaleString()}`;
  };

  // Helper function to display organization limit
  const displayOrgLimit = (limit: number): string | number => {
    return limit === -1 ? "Unlimited" : limit;
  };

  // Helper function to display user limit
  const displayUserLimit = (limit: number): string | number => {
    return limit === -1 ? "Unlimited" : limit;
  };

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent <span className="text-primary">Pricing</span>
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Choose the plan that best fits your business needs. All plans
            include our core payroll processing features.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              className={`bg-white rounded-xl shadow-xl overflow-hidden relative ${
                plan.isPopular
                  ? "ring-2 ring-blue-500 transform md:-translate-y-4"
                  : ""
              }`}
              variants={cardVariants}
            >
              {plan.isPopular && (
                <div className="bg-primary text-white text-sm font-medium py-1 px-3 absolute top-0 right-0 rounded-bl-lg">
                  Most Popular
                </div>
              )}

              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    {formatPrice(plan.price)}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-600 ml-2">lifetime</span>
                  )}
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-5 h-5 mr-3">
                      {plan.features.maxOrganizations > 0 ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <Check className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                    <p className="text-gray-700">
                      {displayOrgLimit(plan.features.maxOrganizations)}{" "}
                      Organization
                      {plan.features.maxOrganizations !== 1 && "s"}
                    </p>
                  </div>

                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-5 h-5 mr-3">
                      {plan.features.maxUsersPerOrg > 0 ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <Check className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                    <p className="text-gray-700">
                      {displayUserLimit(plan.features.maxUsersPerOrg)} User
                      {plan.features.maxUsersPerOrg !== 1 && "s"} per
                      Organization
                    </p>
                  </div>

                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-5 h-5 mr-3">
                      {plan.features.prioritySupport ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <X className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <p className="text-gray-700">Priority Support</p>
                  </div>

                  {plan.features.additionalFeatures.map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <div className="flex-shrink-0 w-5 h-5 mr-3">
                        <Check className="w-5 h-5 text-green-500" />
                      </div>
                      <p className="text-gray-700">{feature}</p>
                    </div>
                  ))}
                </div>

                <Link href="/login">
                  <motion.button
                    className={`w-full ${plan.buttonColor} text-white py-3 rounded-md font-medium text-base`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {plan.buttonText}
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <p className="text-lg text-gray-600 mb-6">
            Need a custom solution for your enterprise?
          </p>
          <Link href="/login">
            <motion.button
              className="bg-white border-2 border-primary text-primary hover:bg-blue-50 px-8 py-3 rounded-md font-medium text-base"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Contact Sales
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;

"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Calculator,
  Clock,
  FileText,
  Shield,
  Smartphone,
  Users,
} from "lucide-react";
import Link from "next/link";

const FeaturesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
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

  const features = [
    {
      title: "Automated Calculations",
      description:
        "Eliminate manual errors with our precise, automated salary and tax calculations.",
      icon: Calculator,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Time Tracking",
      description:
        "Built-in time tracking for hourly employees with overtime calculations.",
      icon: Clock,
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Tax Compliance",
      description:
        "Stay compliant with automatic tax filing and updates to tax regulations.",
      icon: FileText,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Data Security",
      description:
        "Enterprise-grade security protocols to protect sensitive employee data.",
      icon: Shield,
      color: "bg-red-100 text-red-600",
    },
    {
      title: "Mobile Access",
      description:
        "Access payroll information anytime, anywhere with our mobile-friendly interface.",
      icon: Smartphone,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      title: "Multi-user Access",
      description:
        "Set different permission levels for your team members to manage payroll effectively.",
      icon: Users,
      color: "bg-indigo-100 text-indigo-600",
    },
  ];

  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Powerful <span className="text-primary">Features</span>
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Designed to streamline your payroll process, our platform offers
            comprehensive tools for businesses of all sizes.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
              variants={cardVariants}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <div
                className={`${feature.color} w-14 h-14 rounded-lg flex items-center justify-center mb-6`}
              >
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="bg-blue-50 p-8 md:p-12 rounded-2xl max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to simplify your payroll process?
            </h3>
            <p className="text-gray-600 mb-8">
              Join thousands of businesses that have streamlined their payroll
              management with PayrollPro.
            </p>
            <Link href="/login">
              <motion.button
                className="bg-primary hover:bg-primary/80 text-white px-8 py-3 rounded-md font-medium text-base"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started Today
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;

"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

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

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          className="text-center mb-16"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            variants={itemVariants}
          >
            About <span className="text-primary">PayrollPro</span>
          </motion.h2>
          <motion.div
            className="w-20 h-1 bg-primary mx-auto mb-6"
            variants={itemVariants}
          ></motion.div>
          <motion.p
            className="text-lg text-gray-600 max-w-3xl mx-auto"
            variants={itemVariants}
          >
            We simplify payroll management for businesses of all sizes, ensuring
            accurate and timely payments while maintaining compliance with tax
            regulations.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, amount: 0.3 }}
            className="relative h-96 md:h-[500px] rounded-xl overflow-hidden shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-indigo-600/20 z-10 rounded-xl"></div>
            <Image
              src="/commons/story.png"
              alt="PayrollPro Story"
              fill
              className="object-cover rounded-xl"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              Our Story
            </h3>
            <p className="text-gray-600 mb-6">
              Founded by a team of payroll experts and software engineers,
              PayrollPro emerged from a shared frustration with existing payroll
              solutions that were either too complex or too simplistic for
              modern business needs.
            </p>
            <p className="text-gray-600 mb-8">
              We built PayrollPro with a clear mission: to create an intuitive,
              powerful, and compliant payroll solution that grows with your
              business. Our platform handles everything from basic salary
              calculations to complex tax filings, all while providing insights
              to help you make better financial decisions.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  Our Mission
                </h4>
                <p className="text-gray-600">
                  To simplify payroll management and empower businesses to focus
                  on growth.
                </p>
              </div>

              <div className="bg-white p-5 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  Our Vision
                </h4>
                <p className="text-gray-600">
                  To become the global standard for intuitive and compliant
                  payroll processing.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;

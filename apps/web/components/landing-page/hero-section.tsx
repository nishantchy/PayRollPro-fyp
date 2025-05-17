"use client";

import React from "react";
import { motion } from "framer-motion";
import { Link as ScrollLink } from "react-scroll";
import Link from "next/link";

const HeroSection = () => {
  return (
    <section id="home" className="pt-28 pb-20 md:pt-36 md:pb-32">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center">
          {/* Text Content */}
          <motion.div
            className="lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
            >
              Simplify Your <span className="text-primary">Payroll</span>{" "}
              Management
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
            >
              Streamline your payroll process, eliminate errors, and ensure
              compliance with our all-in-one payroll management solution.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7 }}
            >
              <ScrollLink
                to="features"
                spy={true}
                smooth={true}
                offset={-70}
                duration={500}
              >
                <motion.button
                  className="bg-primary hover:bg-primary/80 text-white px-8 py-3 rounded-md font-medium text-base"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Explore Features
                </motion.button>
              </ScrollLink>
              <Link href="/login">
                <motion.button
                  className="bg-white hover:bg-gray-100 text-primary border border-primary px-8 py-3 rounded-md font-medium text-base"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Pricing
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            className="lg:w-1/2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-lg shadow-lg">
              <div className="rounded-lg overflow-hidden shadow-xl">
                <motion.div
                  className="bg-white rounded-lg p-8 flex flex-col gap-6"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">PP</span>
                      </div>
                      <h3 className="font-semibold text-lg">
                        PayrollPro Dashboard
                      </h3>
                    </div>
                    <div className="flex space-x-2">
                      <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                      <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                      <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="bg-gray-100 p-4 rounded-md">
                        <div className="h-2 w-16 bg-blue-300 rounded mb-2"></div>
                        <div className="h-8 w-full bg-blue-200 rounded"></div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between gap-4">
                    <div className="flex-1 h-24 bg-gray-100 rounded-md p-3">
                      <div className="h-2 w-16 bg-green-300 rounded mb-2"></div>
                      <div className="flex items-end h-12 gap-1">
                        <div className="w-1/6 h-4 bg-green-200 rounded-t"></div>
                        <div className="w-1/6 h-8 bg-green-300 rounded-t"></div>
                        <div className="w-1/6 h-6 bg-green-200 rounded-t"></div>
                        <div className="w-1/6 h-10 bg-green-400 rounded-t"></div>
                        <div className="w-1/6 h-5 bg-green-200 rounded-t"></div>
                        <div className="w-1/6 h-7 bg-green-300 rounded-t"></div>
                      </div>
                    </div>
                    <div className="flex-1 h-24 bg-gray-100 rounded-md p-3">
                      <div className="h-2 w-16 bg-blue-300 rounded mb-2"></div>
                      <div className="h-12 w-full rounded-full bg-blue-100 flex items-center justify-center">
                        <div className="h-10 w-10 rounded-full bg-primary border-4 border-white"></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

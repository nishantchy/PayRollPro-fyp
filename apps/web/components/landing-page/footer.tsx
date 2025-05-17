"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Link as ScrollLink } from "react-scroll";
import logo from "@/public/commons/logo-transparent.png";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  const footerLinks = [
    {
      title: "Product",
      links: [
        { name: "Features", to: "features" },
        { name: "Pricing", to: "pricing" },
        { name: "Testimonials", to: "about" },
        { name: "FAQ", to: "about" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About", to: "about" },
        { name: "Careers", to: "about" },
        { name: "Blog", to: "about" },
        { name: "Contact", to: "about" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", to: "about" },
        { name: "Terms of Service", to: "about" },
        { name: "Cookie Policy", to: "about" },
        { name: "GDPR", to: "about" },
      ],
    },
  ];

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Logo and Info */}
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <div className="relative w-40 h-28 mb-6">
                <Image
                  src={logo}
                  alt="PayrollPro Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Simplify your payroll management with our comprehensive
                solution. Ensuring timely and accurate payroll processing for
                businesses of all sizes.
              </p>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    className="bg-gray-800 hover:bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Links */}
          {footerLinks.map((column, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold mb-4">{column.title}</h3>
              <ul className="space-y-3">
                {column.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <ScrollLink
                      to={link.to}
                      spy={true}
                      smooth={true}
                      offset={-70}
                      duration={500}
                      className="text-gray-400 hover:text-white transition-colors duration-300 cursor-pointer"
                    >
                      {link.name}
                    </ScrollLink>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <span className="text-gray-400">info@payrollpro.com</span>
              </li>
              <li className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <span className="text-gray-400">+977 1234567890</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <span className="text-gray-400">Kathmandu, Nepal</span>
              </li>
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="pt-8 border-t border-gray-800 text-center text-gray-500 text-sm"
        >
          <p>&copy; {currentYear} PayrollPro. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;

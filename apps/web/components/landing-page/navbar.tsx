"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Link as ScrollLink } from "react-scroll";
import { motion } from "framer-motion";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Menu, X } from "lucide-react";
import Logo from "@/public/commons/logo-no-text.png";
import { Button } from "../ui/button";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  const navItems = [
    { name: "About", to: "about" },
    { name: "Features", to: "features" },
    { name: "Pricing", to: "pricing" },
  ];

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 py-4 transition-all duration-300 ${
        scrolled ? "bg-white/90 shadow-md backdrop-blur-sm" : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          className="relative w-32 h-16 cursor-pointer "
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Image
            src={Logo}
            alt="PayrollPro Logo"
            fill
            className="object-contain"
            priority
          />
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden md:block">
          <NavigationMenu>
            <NavigationMenuList>
              {navItems.map((item) => (
                <NavigationMenuItem key={item.name}>
                  <ScrollLink
                    to={item.to}
                    spy={true}
                    smooth={true}
                    offset={-70}
                    duration={500}
                    className={`${navigationMenuTriggerStyle()} cursor-pointer`}
                  >
                    {item.name}
                  </ScrollLink>
                </NavigationMenuItem>
              ))}
              <NavigationMenuItem>
                <Link target="_blank" href="/login">
                  <Button className="bg-primary hover:bg-primary/80 text-white px-6 py-2 rounded-md font-medium transition-all">
                    Try Now
                  </Button>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-700 focus:outline-none"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg py-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="container mx-auto px-4 flex flex-col space-y-4">
            {navItems.map((item) => (
              <ScrollLink
                key={item.name}
                to={item.to}
                spy={true}
                smooth={true}
                offset={-70}
                duration={500}
                className="text-gray-700 hover:text-blue-600 py-2 text-lg font-medium cursor-pointer"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </ScrollLink>
            ))}
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Try Now
            </Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Navbar;

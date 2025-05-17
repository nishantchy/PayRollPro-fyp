"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/api/store/auth.store";
import { logout } from "@/api/services/auth.service";
import {
  sidebarLinks,
  bottomLinks,
  SidebarLink,
} from "@/lib/constants/sidebar.links";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout: logoutStore } = useAuthStore();

  // Check if window width is less than 1024px on initial render and when resized
  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      }
    };

    // Set initial state
    checkScreenSize();

    // Add event listener
    window.addEventListener("resize", checkScreenSize);

    // Clean up event listener
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Handle logout
  const handleLogout = () => {
    logout();
    logoutStore();
    router.push("/login");
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  // Render a sidebar link with icon
  const renderLink = (link: SidebarLink, index: number) => {
    const isActive = pathname === link.href;

    // Special handling for logout
    if (link.title === "Logout") {
      return (
        <Button
          key={index}
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full justify-start border border-transparent text-muted-foreground hover:bg-muted hover:text-foreground hover:border-border",
            isActive &&
              "bg-primary/10 text-primary border-primary/20 font-medium",
            collapsed ? "py-3 px-0" : "py-2.5 px-3"
          )}
        >
          {collapsed ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <link.icon className="h-5 w-5 mx-auto" />
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{link.title}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <>
              <link.icon className="h-5 w-5 mr-3" />
              <span>{link.title}</span>
            </>
          )}
        </Button>
      );
    }

    return (
      <Link
        key={index}
        href={link.href}
        className={cn(
          "flex items-center rounded-md py-2.5 px-3 text-sm font-medium transition-colors border",
          isActive
            ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/15"
            : "text-muted-foreground border-transparent hover:bg-muted hover:text-foreground hover:border-border",
          collapsed && "justify-center px-0 py-3"
        )}
      >
        {collapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <link.icon className="h-5 w-5 mx-auto" />
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{link.title}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <>
            <link.icon className="h-5 w-5 mr-3" />
            <span>{link.title}</span>
          </>
        )}
      </Link>
    );
  };

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-background transition-all duration-300 ease-in-out sticky top-0 h-screen",
        collapsed ? "w-[70px]" : "w-[240px]"
      )}
    >
      {/* Toggle button */}
      <div className="flex justify-end p-3 border-b">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleSidebar}
        >
          {collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      {/* Sidebar content */}
      <div className="flex flex-col flex-1 py-4 overflow-y-auto">
        <div className="space-y-2 px-3">
          {sidebarLinks.map((link, index) => renderLink(link, index))}
        </div>
      </div>

      {/* Bottom navigation (logout) */}
      <div className="border-t px-3 py-4">
        <div className="space-y-1">
          {bottomLinks.map((link, index) => renderLink(link, index))}
        </div>
      </div>
    </div>
  );
}

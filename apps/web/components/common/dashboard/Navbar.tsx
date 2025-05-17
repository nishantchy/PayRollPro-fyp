"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Crown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/api/store/auth.store";
import { logout } from "@/api/services/auth.service";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Logo from "@/public/commons/logo-no-text.png";

export default function Navbar() {
  const router = useRouter();
  const { user, logout: logoutStore } = useAuthStore();
  const [avatarSrc, setAvatarSrc] = useState<string>("");
  const [avatarKey, setAvatarKey] = useState<string>("avatar-key");

  // Update avatar source when user data changes
  useEffect(() => {
    if (user?.photo) {
      setAvatarSrc(user.photo);
      // Update key to force re-render of the Avatar component
      setAvatarKey(`avatar-${Date.now()}`);
    }
  }, [user?.photo]);

  const handleLogout = () => {
    logout();
    logoutStore();
    router.push("/login");
  };

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!user?.name) return "U";

    const nameParts = user.name.trim().split(" ");
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();

    return (
      nameParts[0].charAt(0).toUpperCase() +
      nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    );
  };

  return (
    <header className="py-4 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 flex h-14 items-center justify-between">
        {/* Logo on the left */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src={Logo}
            alt="PayrollPro Logo"
            width={102}
            height={102}
            className="h-16 w-16"
          />
          <span className="font-semibold text-2xl">Payroll Pro</span>
        </Link>

        {/* Right side items */}
        <div className="flex items-center gap-4">
          {/* Upgrade button */}
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex items-center gap-1"
          >
            <Crown className="h-4 w-4 text-primary" />
            <span>Upgrade</span>
          </Button>

          {/* Avatar with dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8" key={avatarKey}>
                  <AvatarImage
                    src={avatarSrc}
                    alt={user?.name || "User"}
                    onError={() => setAvatarSrc("")}
                  />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user?.name || "User"}</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.email || ""}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard">Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/account">Account</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

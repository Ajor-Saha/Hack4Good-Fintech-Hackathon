"use client";

import React, { useState } from "react";
import { MdOutlineNotificationsActive } from "react-icons/md";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { sidebarLinks } from "@/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { User, CreditCard, Settings, Keyboard, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/sign-in", // Specify the login page URL
      redirect: true,
    });
  };

  

  return (
    <div>
      {/* Header */}
      <header className="flex items-center justify-between bg-slate-50 p-4 border-b border-gray-300">
        {/* Left side: Logo and name */}
        <Link href="/" className="flex items-center space-x-3">
          <Image
            src="/icons/logo.svg"
            width={34}
            height={34}
            alt="Horizon logo"
            className="h-8 w-8"
          />
          <h1 className="text-gray-600 text-xl font-semibold">Horizon</h1>
        </Link>

        {/* Hamburger menu for small screens */}
        <div className="flex">
          <Popover>
            <PopoverTrigger asChild>
              <button className="mr-3">
                <MdOutlineNotificationsActive size={30} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Notifications</h4>
                  <p className="text-sm text-muted-foreground">
                    See all notifications here
                  </p>
                </div>
                <div className="grid gap-2 text-sm">
                  <div className="pt-1 pb-5 border-b border-slate-400">
                    Budget limit of food has been reached 
                  </div>
                  <div className="pt-1 pb-5 border-b border-slate-400">
                    Budget limit of food has reached 
                  </div>
                  <div className="pt-1 pb-5 border-b border-slate-400">
                    Budget limit of food has reached 
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500 shadow-lg">
                <Image
                  src="/ava1.webp" // replace with your image path
                  alt="User Avatar"
                  width={64}
                  height={64}
                  className="w-12 h-12 object-cover"
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Billing</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Keyboard className="mr-2 h-4 w-4" />
                  <span>Keyboard shortcuts</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4 cursor-pointer" />
                <span className="cursor-pointer">Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Sheet>
            <SheetTrigger asChild>
              <button className="lg:hidden p-3 rounded-lg">
                <Image
                  src="/icons/hamburger.svg"
                  alt="Menu"
                  width={20}
                  height={20}
                />
              </button>
            </SheetTrigger>
            <SheetContent className="p-4 bg-slate-100 text-gray-800">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="space-y-4 mt-4">
                {sidebarLinks.map((item) => {
                  const isActive =
                    pathname === item.route ||
                    pathname.startsWith(`${item.route}/`);

                  return (
                    <Link
                      href={item.route}
                      key={item.label}
                      className={cn(
                        "flex items-center p-3 rounded-lg space-x-4 transition-all duration-200",
                        {
                          "bg-gradient-to-r from-slate-100 to-slate-300":
                            isActive,
                          "hover:bg-slate-300": !isActive,
                        }
                      )}
                    >
                      <div className="relative w-6 h-6">
                        <Image
                          src={item.imgURL}
                          alt={item.label}
                          layout="fill"
                          className={cn("transition-all duration-200", {
                            "brightness-200 invert": isActive,
                          })}
                        />
                      </div>
                      <p
                        className={cn("text-sm font-medium", {
                          "text-gray-700": isActive,
                          "text-gray-800": !isActive,
                        })}
                      >
                        {item.label}
                      </p>
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </div>
  );
};

export default Header;

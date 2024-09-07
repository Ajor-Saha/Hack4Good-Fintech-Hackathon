"use client";

import React, { useCallback, useEffect, useState } from "react";
import { MdOutlineFeaturedPlayList, MdOutlineNotificationsActive } from "react-icons/md";
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
import { User2, CreditCard, Settings, Keyboard, LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { User } from "next-auth";
import { getCurrentUser } from "@/lib/getCurrentUser";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { useToast } from "./ui/use-toast";

const Header = () => {
  const pathname = usePathname();
  const [userDetails, setUserDetails] = useState<any>({});
  const [userNotifications, setUserNotifications] = useState<any>({});
  const [userData, setUserData] = useState<any[]>([]);

  const { toast } = useToast();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/sign-in", // Specify the login page URL
      redirect: true,
    });
  };

  const fetchUserDetails = useCallback(async () => {
    try {
      const response = await axios.get<ApiResponse>("/api/user");
      if (response.data.success) {
        setUserDetails(response.data.data);
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage =
        axiosError.response?.data.message ??
        "Error while fetching user details";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [toast]);

  const fetchUserNotifications = useCallback(async () => {
    try {
      const response = await axios.get<ApiResponse>("/api/notifications");
      if (response.data.success) {
        setUserNotifications(response.data.data);
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage =
        axiosError.response?.data.message ??
        "Error while fetching user notifications";
    }
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      const response = await axios.get<any>(
        "/api/dashboard-data/user-features"
      );
      if (response.data.success) {
        setUserData(response.data.data);
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage =
        axiosError.response?.data.message ??
        "Error while fetching user notifications";
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchUserDetails();
      fetchUserNotifications();
      fetchUserData();
    }
  }, [session, fetchUserDetails, fetchUserNotifications, fetchUserData]);

  return (
    <div>
      {/* Header */}
      <header className="flex items-center justify-between bg-slate-50 dark:bg-gray-900 p-4 border-b border-gray-300">
        {/* Left side: Logo and name */}
        <Link href="/" className="flex items-center space-x-3">
          <Image
            src="/icons/logo.svg"
            width={34}
            height={34}
            alt="Horizon logo"
            className="h-8 w-8"
          />
          <h1 className="text-gray-600 dark:text-gray-200 text-xl font-semibold">
           WealthLens
          </h1>
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
                  {userNotifications?.categories?.length > 0 ? (
                    userNotifications.categories.map((notifciation: any) => (
                      <div
                        key={notifciation?._id}
                        className="pt-1 pb-4 border-b border-slate-400"
                      >
                        <p>Budget limit of {notifciation?.name} been reached</p>
                        <div className="flex justify-between">
                          <span>${notifciation?.spent} spent</span>
                          <span className="pr-8">
                            ${notifciation?.limit} budget
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="pt-1 pb-4 border-b border-slate-400">
                      No notifications Available on budget
                    </div>
                  )}
                  {userData.length > 0 &&
                    userData.map((data, index) =>
                      data.flag === false ? (
                        <Link
                          href={data?.route}
                          key={index}
                          className="pt-1 pb-4 border-b border-slate-400"
                        >
                          Add new {data.name} details
                        </Link>
                      ) : (
                        ""
                      )
                    )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500 shadow-lg">
                <Image
                  src={userDetails?.avatar || "/ava1.webp"} // replace with your image path
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
                  <User2 className="mr-2 h-4 w-4" />
                  <Link className="cursor-pointer" href="/my-profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MdOutlineFeaturedPlayList className="mr-2 h-4 w-4" />
                  <Link className="cursor-pointer" href="/my-feedback">AI Feedback</Link>
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
            <SheetContent className="p-4 dark:text-gray-100 bg-slate-100 dark:bg-gray-900 text-gray-800">
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
                          "bg-gradient-to-r from-slate-100 to-slate-300 dark:from-slate-600 dark:to-slate-800":
                            isActive,
                          "hover:bg-slate-300 dark:hover:bg-slate-700":
                            !isActive,
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
                          "text-gray-700 dark:text-gray-100": isActive,
                          "text-gray-800 dark:text-gray-300": !isActive,
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

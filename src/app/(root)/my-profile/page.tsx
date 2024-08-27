"use client";

import { Button } from "@/components/ui/button";
import { FiEdit3 } from "react-icons/fi";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { accountSchema } from "@/schemas/accountSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Edit, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { User } from "next-auth";
import { passwordSchema } from "@/schemas/passwordSchema";
import Image from "next/image";

const MyProfile = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [userDetails, setUserDetails] = useState<any>({});
  const { data: session } = useSession();
  const user: User = session?.user;

  const form = useForm<z.infer<typeof accountSchema>>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      fullName: "",
      username: "",
      monthlySalary: 1,
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  const fetchUserDetails = useCallback(async () => {
    try {
      const response = await axios.get<ApiResponse>("/api/user");
      if (response.data.success) {
        form.reset(response.data.data);
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
  }, [form, toast]);

  useEffect(() => {
    if (session) {
      fetchUserDetails();
    }
  }, [session, fetchUserDetails]);

  const onSubmit = async (data: z.infer<typeof accountSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.put<ApiResponse>(
        "/api/user/update-profile", // Replace with your actual API endpoint
        data
      );

      toast({
        title: "Success",
        description: response.data.message,
      });

      setIsSubmitting(false);
    } catch (error) {
      console.error("Error updating account details:", error);

      const axiosError = error as AxiosError<ApiResponse>;

      let errorMessage =
        axiosError.response?.data.message ||
        "There was a problem updating your account. Please try again.";

      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });

      setIsSubmitting(false);
    }
  };

  const onPasswordSubmit = async (data: z.infer<typeof passwordSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.put<ApiResponse>(
        "/api/user/change-password", // Replace with your actual API endpoint
        data
      );

      toast({
        title: "Success",
        description: response.data.message,
      });

      setIsSubmitting(false);
    } catch (error) {
      console.error("Error changing password:", error);

      const axiosError = error as AxiosError<ApiResponse>;

      let errorMessage =
        axiosError.response?.data.message ||
        "There was a problem changing your password. Please try again.";

      toast({
        title: "Change Password Failed",
        description: errorMessage,
        variant: "destructive",
      });

      setIsSubmitting(false);
    }
  };

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.put<ApiResponse>(
        "/api/user/change-avatar", // Replace with your actual API endpoint
        formData
      );

      if (response.data.success) {
        fetchUserDetails();
        toast({
          title: "Success",
          description: response.data.message,
          variant: "default",
        });
      } else {
        toast({
          title: "Update Failed",
          description: response.data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage =
        axiosError.response?.data.message ||
        "There was a problem updating your profile picture. Please try again.";

      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex justify-center items-center flex-col py-10">
      <Tabs
        defaultValue="account"
        className="w-[350px] sm:w-[450px] md:w-[600px]"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>
                Make changes to your account here. Click save when you are done.
              </CardDescription>
              <div className="relative mx-auto py-2">
                <Image
                  src={userDetails?.avatar || "/profile-pic.png"} // replace with your image path
                  alt="User Avatar"
                  width={64}
                  height={64}
                  className="w-24 h-24 object-cover rounded-full"
                />
                <label
                  htmlFor="avatarUpload"
                  className="absolute bottom-2 right-2 bg-gray-800 text-white p-2 rounded-full cursor-pointer"
                >
                  <Edit className="w-4 h-4" />
                </label>
                <input
                  type="file"
                  id="avatarUpload"
                  className="hidden"
                  accept="image/*"
                  onChange={onAvatarChange}
                />
              </div>
            </CardHeader>

            <CardContent className="space-y-2">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    name="fullName"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="username"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="username">Username</Label>
                        <Input {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="monthlySalary"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="monthlySalary">Monthly Salary</Label>
                        <Input
                          {...field}
                          type="number"
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Please wait
                      </>
                    ) : (
                      "Save changes"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Change your password here. After saving, you will be logged out.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...passwordForm}>
                <form
                  onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    name="currentPassword"
                    control={passwordForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="current">Current password</Label>
                        <Input
                          {...field}
                          id="current"
                          type="password"
                          autoComplete="current-password"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="newPassword"
                    control={passwordForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="new">New password</Label>
                        <Input
                          {...field}
                          id="new"
                          type="password"
                          autoComplete="new-password"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Please wait
                      </>
                    ) : (
                      "Save password"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyProfile;

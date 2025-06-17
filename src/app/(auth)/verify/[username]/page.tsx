"use client";

import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { verifySchema } from "@/schemas/verifySchema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { MdMoney } from "react-icons/md";

const VerifyAccount = () => {
  const router = useRouter();
  const params = useParams<{ username: string }>();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    mode: "onChange",
  });

  const [otpValue, setOtpValue] = useState("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleOtpChange = (value: string) => {
    setOtpValue(value);
    form.setValue("code", value);
  };

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    setLoading(true)
    try {
      const response = await axios.post<ApiResponse>(`/api/verify-code`, {
        username: params.username,
        code: data.code,
      });

      toast({
        title: "Success",
        description: response.data.message,
      });

      router.replace("/sign-in");
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Verification Failed",
        description:
          axiosError.response?.data.message ??
          "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <div className="flex items-center space-x-3 py-10">
        <MdMoney size={30} className="dark:text-gray-200" />
        <h1 className="text-gray-600 dark:text-gray-200 text-xl font-semibold">WealthLens</h1>
      </div>
      <div className="w-full max-w-md p-8 space-y-8 rounded-lg border-2 border-gray-600 shadow-lg">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6 dark:text-gray-100">
            Verify Your Account
          </h1>
          <p className="mb-4 dark:text-gray-300">Enter the verification code sent to your email</p>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="code" className="block font-semibold text-lg py-2 dark:text-gray-200">
              Verification Code
            </label>
            <InputOTP
              maxLength={7}
              pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
              value={otpValue}
              onChange={handleOtpChange}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
                <InputOTPSlot index={6} />
              </InputOTPGroup>
            </InputOTP>
            {form.formState.errors.code && (
              <p className="text-red-600 dark:text-red-400">
                {form.formState.errors.code.message}
              </p>
            )}
          </div>
          <div className="text-right">
            <Button type="submit" disabled={loading} variant="outline" className="w-24 dark:text-gray-200">
              {loading ? "verifying..." : "Verify"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyAccount;

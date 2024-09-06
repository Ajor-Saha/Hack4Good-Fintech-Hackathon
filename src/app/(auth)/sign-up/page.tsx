"use client";
import { signUpSchema } from "@/schemas/signUpSchema";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

function SignUpForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>("/api/sign-up", data);
      toast({
        title: "Success",
        description: response.data.message,
      });
      router.replace(`/verify/${data.username}`);
    } catch (error) {
      console.error("Error during sign-up:", error);
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage =
        axiosError.response?.data.message ??
        "There was a problem with your sign-up. Please try again.";
      toast({
        title: "Sign Up Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="font-[sans-serif] pb-16 flex flex-col justify-center  items-center  px-5">
      <div className="flex items-center space-x-3 py-10">
        <Image
          src="/icons/logo.svg"
          width={34}
          height={34}
          alt="Horizon logo"
          className="h-8 w-8"
        />
        <h1 className="text-gray-600 text-xl font-semibold">Horizon</h1>
      </div>
      <div className="w-full max-w-4xl mx-auto lg:border dark:lg:border-gray-800 rounded-md">
        <div className="grid md:grid-cols-2 lg:gap-24 gap-16 w-full sm:p-8 p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.3)] rounded overflow-hidden">
          <div className="max-md:order-1 space-y-6">
            <div className="md:mb-16 mb-8">
              <h3 className="text-2xl font-extrabold">Instant Access</h3>
            </div>
            <div className="space-y-6">
              <button
                type="button"
                className="w-full px-4 py-3 flex items-center justify-center rounded text-[#333] text-base tracking-wider font-semibold border-none outline-none bg-gray-100 hover:bg-gray-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22px"
                  fill="#fff"
                  className="inline shrink-0 mr-4"
                  viewBox="0 0 512 512"
                >
                  <path
                    fill="#fbbd00"
                    d="M120 256c0-25.367 6.989-49.13 19.131-69.477v-86.308H52.823C18.568 144.703 0 198.922 0 256s18.568 111.297 52.823 155.785h86.308v-86.308C126.989 305.13 120 281.367 120 256z"
                  />
                  <path
                    fill="#0f9d58"
                    d="m256 392-60 60 60 60c57.079 0 111.297-18.568 155.785-52.823v-86.216h-86.216C305.044 385.147 281.181 392 256 392z"
                  />
                  <path
                    fill="#31aa52"
                    d="m139.131 325.477-86.308 86.308a260.085 260.085 0 0 0 22.158 25.235C123.333 485.371 187.62 512 256 512V392c-49.624 0-93.117-26.72-116.869-66.523z"
                  />
                  <path
                    fill="#3c79e6"
                    d="M512 256a258.24 258.24 0 0 0-4.192-46.377l-2.251-12.299H256v120h121.452a135.385 135.385 0 0 1-51.884 55.638l86.216 86.216a260.085 260.085 0 0 0 25.235-22.158C485.371 388.667 512 324.38 512 256z"
                  />
                  <path
                    fill="#cf2d48"
                    d="m352.167 159.833 10.606 10.606 84.853-84.852-10.606-10.606C388.668 26.629 324.381 0 256 0l-60 60 60 60c36.326 0 70.479 14.146 96.167 39.833z"
                  />
                  <path
                    fill="#eb4132"
                    d="M256 120V0C187.62 0 123.333 26.629 74.98 74.98a259.849 259.849 0 0 0-22.158 25.235l86.308 86.308C162.883 146.72 206.376 120 256 120z"
                  />
                </svg>
                Continue with Google
              </button>
            </div>
          </div>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
            <div className="mb-8">
              <h3 className="text-2xl font-extrabold">Register</h3>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-sm mb-2 block">Full Name</label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    {...form.register("fullName")}
                    required
                    className="bg-white dark:text-gray-700 border border-gray-300 w-full text-sm pl-4 pr-10 py-2.5 rounded outline-blue-500"
                    placeholder="Enter full name"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#bbb"
                    stroke="#bbb"
                    className="w-4 h-4 absolute right-4"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="10" cy="7" r="6" />
                    <path d="M14 15H6a5 5 0 0 0-5 5 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 5 5 0 0 0-5-5zm8-4h-2.59l.3-.29a1 1 0 0 0-1.42-1.42l-2 2a1 1 0 0 0 0 1.42l2 2a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42l-.3-.29H22a1 1 0 0 0 0-2z" />
                  </svg>
                </div>
              </div>
              <div>
                <label className="text-sm mb-2 block">Username</label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    {...form.register("username")}
                    required
                    className="bg-white dark:text-gray-700 border border-gray-300 w-full text-sm pl-4 pr-10 py-2.5 rounded outline-blue-500"
                    placeholder="Enter username"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#bbb"
                    stroke="#bbb"
                    className="w-4 h-4 absolute right-4"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="10" cy="7" r="6" />
                    <path d="M14 15H6a5 5 0 0 0-5 5 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 5 5 0 0 0-5-5zm8-4h-2.59l.3-.29a1 1 0 0 0-1.42-1.42l-2 2a1 1 0 0 0 0 1.42l2 2a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42l-.3-.29H22a1 1 0 0 0 0-2z" />
                  </svg>
                </div>
                {form.formState.errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.fullName.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm mb-2 block">Email Id</label>
                <div className="relative flex items-center">
                  <input
                    type="email"
                    {...form.register("email")}
                    required
                    className="bg-white dark:text-gray-700 border border-gray-300 w-full text-sm pl-4 pr-10 py-2.5 rounded outline-blue-500"
                    placeholder="Enter email"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#bbb"
                    stroke="#bbb"
                    className="w-4 h-4 absolute right-4"
                    viewBox="0 0 682.667 682.667"
                  >
                    <defs>
                      <clipPath id="a" clipPathUnits="userSpaceOnUse">
                        <path d="M0 512h512V0H0Z" />
                      </clipPath>
                    </defs>
                    <g
                      clipPath="url(#a)"
                      transform="matrix(1.33 0 0 -1.33 0 682.667)"
                    >
                      <path
                        fill="none"
                        strokeMiterlimit="10"
                        strokeWidth="40"
                        d="M452 444H60c-22.091 0-40-17.909-40-40v-39.446l212.127-157.782c14.17-10.54 33.576-10.54 47.746 0L492 364.554V404c0 22.091-17.909 40-40 40Z"
                      />
                      <path d="M472 92H40c-22.091 0-40 17.909-40 40v240c0 22.091 17.909 40 40 40h432c22.091 0 40-17.909 40-40V132c0-22.091-17.909-40-40-40Zm-16.627 65.421L276.666 254.562c-10.69 7.949-25.642 7.949-36.332 0L56.627 157.421c-6.157-4.585-7.41-13.21-2.825-19.366 4.584-6.158 13.208-7.411 19.366-2.826L257.875 232.37c4.277 3.183 10.21 3.183 14.486 0L455.832 135.23c6.158-4.584 14.782-3.332 19.366 2.826 4.585 6.156 3.332 14.78-2.825 19.365Z" />
                    </g>
                  </svg>
                </div>
                {form.formState.errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              

              <div>
                <label className="text-sm mb-2 block">Password</label>
                <div className="relative flex items-center">
                  <input
                    type="password"
                    {...form.register("password")}
                    required
                    className="bg-white dark:text-gray-700 border border-gray-300 w-full text-sm pl-4 pr-10 py-2.5 rounded outline-blue-500"
                    placeholder="Enter password"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#bbb"
                    stroke="#bbb"
                    className="w-4 h-4 absolute right-4"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm6-5V7a6 6 0 0 0-12 0v1a4 4 0 0 0-4 4v6a4 4 0 0 0 4 4h12a4 4 0 0 0 4-4v-6a4 4 0 0 0-4-4ZM8 7a4 4 0 1 1 8 0v1H8Zm12 12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2Z" />
                  </svg>
                </div>
                {form.formState.errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              
              <button
                type="submit"
                className="w-full bg-blue-500 text-white rounded py-3 text-sm font-semibold tracking-wider border-none outline-none hover:bg-blue-600 flex justify-center items-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-5 animate-spin" />
                    Please wait
                  </>
                ) : (
                  "Sign Up"
                )}
              </button>
              <div className="text-center">
                <span className="text-sm">Already have an account? </span>
                <Link
                  href="/sign-in"
                  className="text-blue-500 hover:underline text-sm"
                >
                  Login
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUpForm;

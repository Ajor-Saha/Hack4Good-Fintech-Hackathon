import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";



export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  if (!session) {
    // If there’s no session, redirect to the sign-in page
    redirect("/sign-in");
  }

  return (

    <div className="flex flex-col h-screen">
      {/* Header */}
      <Header />

      <div className="flex flex-grow  lg:items-start">
        {/* Main content area */}
        <Sidebar />
        <div className="w-full max-w-4xl">
          {children}
        </div>
      </div>
    </div>
  );
}

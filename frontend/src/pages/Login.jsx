import React from "react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 sm:p-8 bg-[#F8F8F5] u-background-grid-dark-2 text-[#17103D] font-sans">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}

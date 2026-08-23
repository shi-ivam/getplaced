import React from "react";
import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 sm:p-8 bg-[#F8F8F5] u-background-grid-dark-2 text-[#17103D] font-sans">
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
    </div>
  );
}

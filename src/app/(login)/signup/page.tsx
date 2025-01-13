import LoginImage from "@/components/login/login-image";
import SignUpForm from "@/components/login/signup-form";
import React from "react";

const SignupPage = () => {
  return (
    <main className="h-screen grid grid-cols-2 relative">
      <LoginImage />
      <div className="relative flex flex-col items-center justify-center p-8 h-full w-full">
        <div className=" w-[400px] mx-auto">
          <SignUpForm />
        </div>
      </div>
    </main>
  );
};

export default SignupPage;

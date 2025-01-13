import React from "react";
import LoginForm from "@/components/login/login-form";
import LoginImage from "@/components/login/login-image";
interface SearchParamsProps {
  state?: string;
}

const LoginPage = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParamsProps>;
}) => {
  const { state } = await searchParams;
  console.log(state);
  return (
    <main className="h-screen grid grid-cols-2 relative">
      <LoginImage />
      <div className="relative flex flex-col items-center justify-center p-8 h-full w-full">
        <div className=" w-[400px] mx-auto">
          <LoginForm />
        </div>
      </div>
    </main>
  );
};

export default LoginPage;

import React from "react";
import AuthImg from "@/public/login-banner.jpeg";
import Image from "next/image";
import Logo from "@/components/logo";
// import AuthForm from "@/components/login/auth-form";
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
      <div className="relative w-full flex flex-col bg-muted p-10 text-primary-foreground">
        <div className="w-full h-[30%] bg-gradient-to-t from-transparent to-black/50 absolute top-0 left-0 z-10"></div>
        <div className="w-full h-[40%] bg-gradient-to-b from-transparent to-black/50 absolute bottom-0 left-0 z-10"></div>

        <Image
          src={AuthImg}
          alt="login"
          fill
          className="w-full h-full object-cover"
        />
        <div className="relative z-20 flex items-center">
          <Logo />
        </div>
        <div className="relative z-10 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              “Pictoria AI is a game changer for me. I have been able to
              generate high quality professional headshots within minutes. It
              has saved me countless hours of work and cost as well.”
            </p>
            <footer>David S.</footer>
          </blockquote>
        </div>
      </div>
      <div className="relative flex flex-col items-center justify-center p-8 h-full w-full">
        <div className=" w-[400px] mx-auto">
          {/* <AuthForm state={state ?? "login"} /> */}
        </div>
      </div>
    </main>
  );
};

export default LoginPage;

import React from "react";
import AuthImg from "@/public/login-banner.jpeg";
import Image from "next/image";
import Logo from "@/components/logo";

const LoginImage = () => {
  return (
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
    </div>
  );
};

export default LoginImage;

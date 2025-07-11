import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <footer className="container mx-auto flex flex-col gap-2 sm:flex-row py-6 w-full items-center border-t">
      <p>
        &copy; {new Date().getFullYear()} 绘图平台 版权所有
      </p>
      <nav className="sm:ml-auto flex gap-4 sm:gap-6">
        <Link href="#" className="text-xs hover:underline underline-offset-4">
          服务条款
        </Link>
        <Link href="#" className="text-xs hover:underline underline-offset-4">
          隐私政策
        </Link>
      </nav>
    </footer>
  );
};

export default Footer;

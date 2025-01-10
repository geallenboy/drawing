import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <footer className="container mx-auto flex flex-col gap-2 sm:flex-row py-6 w-full items-center border-t">
      <p>
        &copy; {new Date().getFullYear()} Image AI Inc. All rights reserved.
      </p>
      <nav className="sm:ml-auto flex gap-4 sm:gap-6">
        <Link href="#" className="text-xs hover:underline underline-offset-4">
          Tems of Service{" "}
        </Link>
        <Link href="#" className="text-xs hover:underline underline-offset-4">
          Privacy Policy
        </Link>
      </nav>
    </footer>
  );
};

export default Footer;

"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

import { ModeToggle } from "./mode-toggle";
import Logo from "@/components/custom/logo";
import { useUserStore } from "@/store/userStore";

const NavItemsRight = ({ user }: { user: any }) => {
  return (
    <>
      <ModeToggle />
      {user ? (
        <Link
          href={"/dashboard"}
          className="text-sm font-medium hover:underline underline-offset-4"
        >
          <Button variant={"outline"}>进入控制台</Button>
        </Link>
      ) : (
        <Link href={"/sign-in"} className="text-sm font-medium hover:underline underline-offset-4">
          <Button variant={"outline"}>登录</Button>
        </Link>
      )}
    </>
  );
};
const NavItemsLeft = () => {
  return (
    <>
      <Link href={"#features"} className="text-sm font-medium hover:underline underline-offset-4">
        功能特性
      </Link>
      <Link href={"#faqs"} className="text-sm font-medium hover:underline underline-offset-4">
        常见问题
      </Link>
    </>
  );
};

const Navigtion = () => {
  const { user } = useUserStore();
  console.log(user, 11);
  return (
    <div className="w-full bg-background/60 backdrop-blur-md fixed top-0 px-8 py-4 z-50 shadow-xl overflow-hidden">
      <header className="contariner mx-auto flex items-center ">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center justify-center gap-6">
            <Logo />
            <nav className="hidden md:flex items-center justify-center gap-3 ml-2">
              <NavItemsLeft />
            </nav>
          </div>
          <div className="hidden md:flex items-center justify-center gap-3">
            <NavItemsRight user={user} />
          </div>
        </div>
        <div className="ml-auto md:hidden overflow-hidden">
          <Sheet>
            <SheetTrigger>
              <Menu className="h-6 w-6" strokeWidth={1.5} />
            </SheetTrigger>
            <SheetContent>
              <SheetTitle className="sr-only">导航</SheetTitle>
              <nav className="flex flex-col gap-4 mt-12">
                <NavItemsLeft />
                <NavItemsRight user={user} />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </div>
  );
};

export default Navigtion;

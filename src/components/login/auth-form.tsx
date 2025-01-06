"use client";
import React, { useState } from "react";
import LoginForm from "./login-form";
import { Button } from "../ui/button";
import SignUpForm from "./signup-form";
import Link from "next/link";
import ResetPassword from "./reset-password";

export const AuthForm = () => {
  const [mode, setMode] = useState("login");
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {mode === "reset"
            ? "Reset Password"
            : mode === "login"
            ? "Login"
            : "Sign Up"}
        </h1>
        <p className="text-sm text-gray-400">
          {mode === "reset"
            ? "Enter your email below to rest your password"
            : mode === "login"
            ? "Enter your email below to login to your account"
            : "Enter your inforation below to create an account"}
        </p>
      </div>
      <div>
        {mode === "login" && (
          <>
            <LoginForm className="" />
            <div className="text-center flex justify-between">
              <Button
                variant={"link"}
                className="p-0"
                onClick={() => setMode("signup")}
              >
                Need an account? Sign up
              </Button>
              <Button
                variant={"link"}
                className="p-0"
                onClick={() => setMode("reset")}
              >
                Forgot pasword?
              </Button>
            </div>
          </>
        )}
        {mode === "signup" && (
          <>
            <SignUpForm className="" />
            <div className="text-center flex items-center justify-center">
              <Button
                variant={"link"}
                className="p-0"
                onClick={() => setMode("login")}
              >
                Already have an account? Log up
              </Button>
            </div>
            <p className="px-8 text-center text-sm text-muted-foreground">
              By clicing sign up ,you aggree to our{" "}
              <Link
                href={"#"}
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href={"#"}
                className="underline underline-offset-4 hover:text-primary"
              >
                Privacy policy.
              </Link>
            </p>
          </>
        )}
        {mode === "reset" && (
          <>
            <ResetPassword className="" />
            <div className="text-center">
              <Button
                variant={"link"}
                className="p-0 text-black"
                onClick={() => setMode("login")}
              >
                Back to login
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthForm;

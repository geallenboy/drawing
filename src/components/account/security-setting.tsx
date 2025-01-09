"use client";
import { User } from "@supabase/supabase-js";
import React, { useId } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { resetPasswordAction } from "@/app/actions/auth-actions";

interface SecuritySettingProps {
  user: User | null;
}
const SecuritySetting = ({ user }: SecuritySettingProps) => {
  const toastId = useId();

  const handleChangePassword = async () => {
    toast.loading("Sending password reset email...", { id: toastId });
    try {
      const { success, error } = await resetPasswordAction({
        email: user?.email || "",
      });
      if (!success) {
        toast.error(error, { id: toastId });
      } else {
        toast.success(
          "Password reset email sent! Please check your email for instructions",
          { id: toastId }
        );
      }
    } catch (error: any) {
      toast.error(
        error?.message || "There is an error sending the password reset email",
        { id: toastId }
      );
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Security</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <h3 className="font-medium">Password</h3>
          <p className="text-sm text-muted-foreground">
            Change your password to keep your account secure
          </p>
          <Button variant={"outline"} onClick={handleChangePassword}>
            Change password
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecuritySetting;

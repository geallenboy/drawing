"use client";
import { User } from "@supabase/supabase-js";
import React, { useId } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateProfileAction } from "@/app/actions/auth-actions";

interface AccountFormProps {
  user: User | null;
}
const accountFormSchema = z.object({
  fullName: z.string().min(2).max(36),
  email: z.string().email(),
});

const AccountForm = ({ user }: AccountFormProps) => {
  const toastId = useId();
  const form = useForm<z.infer<typeof accountFormSchema>>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      fullName: user?.user_metadata?.fullName || "",
      email: user?.email,
    },
  });
  // 2. Define a submit handler.
  const onSubmit = async (values: z.infer<typeof accountFormSchema>) => {
    toast.loading("Updating the profile...", { id: toastId });
    try {
      const { success, error } = await updateProfileAction(values);
      if (!success) {
        toast.error(error, { id: toastId });
      } else {
        toast.success("Profile updated successfully", { id: toastId });
      }
    } catch (error: any) {
      toast.error(error?.message || "profile updated failed", { id: toastId });
    }
    console.log(values);
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update your personal infomation</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>fullName</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>email</FormLabel>
                  <FormControl>
                    <Input disabled {...field} />
                  </FormControl>
                  <FormDescription>
                    Your email address is used for sign in add communication.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">update profile</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AccountForm;

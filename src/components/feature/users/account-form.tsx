"use client";

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
import { User } from "@/drizzle/schemas";

const accountFormSchema = z.object({
  fullName: z.string().min(1).max(36),
  email: z.string().email(),
});

const AccountForm = ({ user }: { user: User | null }) => {
  const toastId = useId();
  const form = useForm<z.infer<typeof accountFormSchema>>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
    },
  });

  console.log(user, "--->");
  return (
    <Card>
      <CardHeader>
        <CardTitle>账户信息</CardTitle>
        <CardDescription>管理您的账户设置和个人信息</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-8">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>姓名</FormLabel>
                  <FormControl>
                    <Input disabled {...field} />
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
                  <FormLabel>邮箱</FormLabel>
                  <FormControl>
                    <Input disabled {...field} />
                  </FormControl>
                  <FormDescription>这是您登录时使用的邮箱地址</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled type="submit">
              更新账户信息
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AccountForm;

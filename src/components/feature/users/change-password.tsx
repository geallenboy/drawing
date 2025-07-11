"use client";
import React, { useId, useState } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
// import { changePasswordAction } from "@/app/actions/auth-actions";
import { useRouter } from "next/navigation";

const passwordValidationRegex = new RegExp(
  "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
);

export const ChangePassword = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toastId = useId();
  
  const formSchema = z
    .object({
      password: z
        .string()
        .min(8, {
          message: "密码至少需要8个字符",
        })
        .regex(passwordValidationRegex, {
          message: "密码必须包含大小写字母、数字和特殊字符",
        }),
      confirmPassword: z.string({
        required_error: "请确认密码",
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "两次输入的密码不一致",
      path: ["confirmPassword"],
    });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    toast.loading("正在修改密码...", { id: toastId });
    setLoading(true);

    // try {
    //   const { success, error } = await changePasswordAction(values.password);
    //   if (!success) {
    //     toast.error(String(error), { id: toastId });
    //     setLoading(false);
    //   } else {
    //     toast.success("密码修改成功", { id: toastId });
    //     setLoading(false);
    //     router.push("/dashboard");
    //   }
    // } catch (error: any) {
    //   toast.error(String(error?.message), { id: toastId });
    // } finally {
    //   setLoading(false);
    // }
  };
  return (
    <div className={cn("grid gap-6")}>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          修改密码
        </h1>
        <p className="text-sm text-muted-foreground">
          请输入您的新密码
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>新密码</FormLabel>
                <FormControl>
                  <Input type={"password"} {...field} />
                </FormControl>
                <FormDescription>
                  密码必须包含至少8个字符，包括大小写字母、数字和特殊字符
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>确认密码</FormLabel>
                <FormControl>
                  <Input type={"password"} {...field} />
                </FormControl>
                <FormDescription>
                  请再次输入相同的密码进行确认
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full p-4">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "正在修改..." : "修改密码"}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            修改密码后您需要重新登录
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ChangePassword;

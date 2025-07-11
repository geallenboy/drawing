"use client";

import React, { useId } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const SecuritySetting = ({ user }: any) => {
  const toastId = useId();
  const handleChangePassword = async () => {
    toast.loading("正在加载...", { id: toastId });
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>安全设置</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <h3 className="font-medium">密码管理</h3>
          <p className="text-sm text-muted-foreground">
            更改您的密码以确保账户安全
          </p>
          <Button variant={"outline"} disabled onClick={handleChangePassword}>
            更改密码
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecuritySetting;

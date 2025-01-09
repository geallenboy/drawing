import AccountForm from "@/components/account/account-form";
import SecuritySetting from "@/components/account/security-setting";
import { getUser } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import React from "react";

const AccountSettingsPage = async () => {
  const supabase = await createClient();
  const user = await getUser(supabase);
  if (!user) {
    return redirect("/login");
  }

  return (
    <div className="container mx-auto space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Account settings
        </h1>
        <p className="text-muted-foreground mb-6">
          Manage your account settings and preferences.
        </p>
      </div>
      <div className="gird space-y-4">
        <AccountForm user={user} />
        <SecuritySetting user={user} />
      </div>
    </div>
  );
};

export default AccountSettingsPage;

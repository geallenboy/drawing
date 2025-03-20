import Title from "@/components/feature/dashboard/title";
import AccountForm from "@/components/feature/users/account-form";
import SecuritySetting from "@/components/feature/users/security-setting";
import React from "react";

const AccountSettingsPage = async () => {
  return (
    <div className="container mx-auto space-y-4">
      <Title />
      <div className="gird space-y-4">
        <AccountForm user={null} />
        <SecuritySetting user={null} />
      </div>
    </div>
  );
};

export default AccountSettingsPage;

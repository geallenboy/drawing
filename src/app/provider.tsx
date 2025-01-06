"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import { UserDetailContext } from "@/_context/UserDetailConext";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import Header from "./_components/Header";

const provider = ({ children }: { children: React.ReactNode }) => {
  const [userDetail, setUserDetail] = useState<any>();

  useEffect(() => {}, []);

  return (
    <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
      <PayPalScriptProvider
        options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "" }}
      >
        <Header />
        {children}
      </PayPalScriptProvider>
    </UserDetailContext.Provider>
  );
};

export default provider;

"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import { UserDetailContext } from "@/_context/UserDetailConext";
import Header from "@/components/Header";

const provider = ({ children }: { children: React.ReactNode }) => {
  const [userDetail, setUserDetail] = useState<any>();

  useEffect(() => {}, []);

  return (
    <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
      {children}
    </UserDetailContext.Provider>
  );
};

export default provider;

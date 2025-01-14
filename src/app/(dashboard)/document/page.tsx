import React from "react";
import FileList from "@/components/document/file-list";
import Header from "@/components/document/header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const DocumentPage = async () => {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/login");
  }

  return (
    <div className="container mx-auto space-y-4">
      <Header />
      <FileList />
    </div>
  );
};

export default DocumentPage;

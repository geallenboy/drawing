import React from "react";
import { createServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DocumentContent from "@/components/document/document-content";

const DocumentPage = async () => {
  const supabase = await createServer();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/login");
  }

  return <DocumentContent />;
};

export default DocumentPage;

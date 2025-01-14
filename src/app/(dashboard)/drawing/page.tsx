import React from "react";
import FileList from "@/components/drawing/file-list";
import Header from "@/components/drawing/header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const DrawingPage = async () => {
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

export default DrawingPage;

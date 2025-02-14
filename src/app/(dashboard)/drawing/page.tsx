import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CanvasContent from "@/components/drawing/canvas-content";

const DrawingPage = async () => {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/login");
  }

  return <CanvasContent />;
};

export default DrawingPage;

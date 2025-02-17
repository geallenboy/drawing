import React from "react";
import { createServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CanvasContent from "@/components/drawing/canvas-content";

const DrawingPage = async () => {
  const supabase = await createServer();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/login");
  }

  return <CanvasContent />;
};

export default DrawingPage;

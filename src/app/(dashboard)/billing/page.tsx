import PlanSummarry from "@/components/billing/plan-summary";
import { getProducts, getSubscription, getUser } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import React from "react";

const BillingPage = async () => {
  const supabase = await createClient();
  const [user, products, subscription] = await Promise.all([
    getUser(supabase),
    getProducts(supabase),
    getSubscription(supabase),
  ]);
  if (!user) {
    return redirect("/login");
  }
  return (
    <section className="container mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-2">
        Plans & Billing
      </h1>
      <p className="text-muted-foreground mb-6">
        Manage your subscription and billing information.
      </p>
      <div className="grid gap-10">
        <PlanSummarry
          subscription={subscription}
          user={user}
          products={products || []}
        />
      </div>
    </section>
  );
};

export default BillingPage;

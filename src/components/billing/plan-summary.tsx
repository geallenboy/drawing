import { Tables } from "@datatypes.types";
import { User } from "@supabase/supabase-js";
import React from "react";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import PricingSheet from "./pricing-sheet";

type Product = Tables<"products">;
type Price = Tables<"prices">;
type Subscription = Tables<"subscriptions">;

interface ProductWithPrices extends Product {
  prices: Price[];
}
interface PriceWithProduct extends Price {
  products: Product | null;
}

interface SubscriptionWithProduct extends Subscription {
  prices: PriceWithProduct | null;
}

interface PlanSummarryProps {
  subscription: SubscriptionWithProduct | null;
  user: User | null;
  products: ProductWithPrices[] | null;
}

const PlanSummarry = ({ subscription, user, products }: PlanSummarryProps) => {
  if (!subscription || subscription?.status !== "active") {
    return (
      <Card className="max-w-5xl">
        <CardContent className="px-5 py-4">
          <h3 className="pb-4 text-base font-semibold flex flex-wrap items-center gap-x-2">
            <span>Plan Summary</span>
            <Badge variant={"secondary"} className="bg-primary/10">
              No Plan
            </Badge>
          </h3>
          <div className="grid grid-col-8 gap-4">
            <div className="col-span-5 flex flex-col pr-12">
              <div className="flex-1 text-sm font-normal flex w-full justify-between pb-1">
                <span className="font-normal text-muted-foreground ml-1 lowercase">
                  Image Generation credits left
                </span>
                <span className="font-medium">0 rmmaining</span>
              </div>
              <div className="mb-1 flex items-center">
                <Progress value={0} className="w-full h-2" />
              </div>
              <div className="flex-1 text-sm font-normal flex w-full justify-between pb-1">
                <span className="font-normal text-muted-foreground ml-1 lowercase">
                  model training credits left
                </span>
                <span className="font-medium">0 rmmaining</span>
              </div>
              <div className="mb-1 flex items-center">
                <Progress value={0} className="w-full h-2" />
              </div>
            </div>
            <div className="col-span-full flex flex-col">
              Please upgrade to a plan to continue using the app.
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t border-border px-4 py-3">
          <span className="flex ml-auto flex-row">
            <PricingSheet
              subscription={subscription}
              user={user}
              products={products ?? []}
            />
          </span>
        </CardFooter>
      </Card>
    );
  }
  return <div>PlanSummarry</div>;
};

export default PlanSummarry;

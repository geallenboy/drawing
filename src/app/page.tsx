import Faqs from "@/components/landing-page/faqs";
import Features from "@/components/landing-page/features";
import Footer from "@/components/landing-page/footer";
import Hero from "@/components/landing-page/hero";
import Navigtion from "@/components/landing-page/navigation";
import PricingPage from "@/components/landing-page/pricing";
import Testimonials from "@/components/landing-page/testimonials";
import { Button } from "@/components/ui/button";
import { getProducts, getUser } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();
  const [user, products] = await Promise.all([
    getUser(supabase),
    getProducts(supabase),
  ]);

  return (
    <main className="flex flex-col min-h-screen items-center justify-center">
      <Navigtion />
      <Hero />
      <Features />
      <Testimonials />
      <Faqs />
      <PricingPage products={products ?? []} />
      <section className="w-full mt-16 py-16 bg-muted">
        <div className="container px-6 xs:px-8 sm:px-0 lg:mx-auto">
          <div className="flex flex-col items-center space-y-4 text-center">
            <h2 className="subHeading font-bold">
              {" "}
              Ready to Transform Your Photos?
            </h2>
            <p className="subText mt-4 text-center">
              Join thousands of users who are already creating amazing
              AI-generated images.
            </p>
            <Link href={"/login?state=signup"}>
              <Button className=" rounded-md text-base h-12">
                Create Your First AI Model
              </Button>
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

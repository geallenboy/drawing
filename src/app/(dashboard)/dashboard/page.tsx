import { getCreditsAction } from "@/app/actions/credits-action";
import { getImagesAction } from "@/app/actions/image-action";
import { getModelsAction } from "@/app/actions/model-actions";
import QuickAction from "@/components/dashboard/quick-action";
import RecentImage from "@/components/dashboard/recent-images";
import RecentModels from "@/components/dashboard/recent-models";
import StatsCards from "@/components/dashboard/stats-card";
import { createClient } from "@/lib/supabase/server";

const DashboardPage = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: models, count: modelCount } = await getModelsAction();
  const { data: images } = await getImagesAction();
  const { data: credits } = await getCreditsAction();
  const imageCount = images?.length || 0;
  return (
    <section className="container mx-auto flex-1 space-y-6">
      <div className="flex items-center justify-center">
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome back,{user?.user_metadata.fullName}
        </h2>
      </div>
      <StatsCards
        imageCount={imageCount}
        modelCount={modelCount}
        credits={credits}
      />
      <div className="grid gap-6 grid-cols-4">
        <RecentImage images={images?.slice(0, 6) ?? []} />
        <div className="h-full flex flex-col space-y-6">
          <QuickAction />
          <RecentModels models={models ?? []} />
        </div>
      </div>
    </section>
  );
};

export default DashboardPage;

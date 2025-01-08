import { fetachModelsAction } from "@/app/actions/model-actions";
import ModelsList from "@/components/model/models-list";
import React from "react";

const ModelsPage = async () => {
  const data = await fetachModelsAction();

  return (
    <section className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Modles</h1>
        <p className="mt-2 text-muted-foreground">
          View and manage your trained models
        </p>
      </div>
      <ModelsList models={data} />
    </section>
  );
};

export default ModelsPage;

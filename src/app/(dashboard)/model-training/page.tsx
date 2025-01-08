import ModelTraningForm from "@/components/model-training/model-training-form";
import React from "react";

const ModelTrainingPage = () => {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-2">Train Model</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Train anew model with yout own image
      </p>
      <ModelTraningForm />
    </div>
  );
};

export default ModelTrainingPage;

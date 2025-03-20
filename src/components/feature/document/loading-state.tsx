// file-list/loading-state.tsx
"use client";

import React from "react";

const LoadingState = () => {
  return (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  );
};

export default LoadingState;

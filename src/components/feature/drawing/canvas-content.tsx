"use client";
import React, { useState } from "react";
import Header from "./header";
import DrawingList from "./drawing-list";

const CanvasContent = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="container mx-auto space-y-4">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <DrawingList searchQuery={searchQuery} />
    </div>
  );
};

export default CanvasContent;

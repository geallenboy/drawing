"use client";
import React, { useState } from "react";
import Header from "./header";
import FileList from "./file-list";

const DocumentContent = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="container mx-auto space-y-4">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <FileList searchQuery={searchQuery} />
    </div>
  );
};

export default DocumentContent;

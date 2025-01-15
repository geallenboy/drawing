"use client";
import { getByIdFileAction } from "@/app/actions/file-actions";
import Editor from "@/components/document/editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const DocumentWorkspace = () => {
  const [inputVal, setInputVal] = useState("");
  const params = useParams();
  const id = (params.id || "") as string;

  const [triggerSave, setTriggerSave] = useState(false);
  const [fileData, setFileData] = useState<any>();

  const getFileData = async () => {
    const { data, success } = await getByIdFileAction(id);

    if (success && data.length > 0) {
      setFileData(data[0]);
      setInputVal(data[0].name);
    } else {
      setFileData(null);
    }
  };
  useEffect(() => {
    id && getFileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onSave = async () => {
    setTriggerSave(!triggerSave);
  };

  const inputChange = (e: any) => {
    setInputVal(e.target.value);
  };

  return (
    <div>
      <div className="flex items-center justify-end">
        <Input value={inputVal} onChange={inputChange} className="w-[200px] mr-2" />
        <Button
          className="h-8 text-[12px] gap-2 bg-yellow-500 hover:bg-yellow-600"
          onClick={onSave}
        >
          <Save className="h-4 w-4" /> 保存
        </Button>
      </div>
      <div className="h-screen">
        <Editor name={inputVal} fileData={fileData} triggerSave={triggerSave} />
      </div>
    </div>
  );
};

export default DocumentWorkspace;

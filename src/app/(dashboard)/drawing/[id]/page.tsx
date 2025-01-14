"use client";
import { getByIdDrawingAction } from "@/app/actions/drawing-action";
import Canvas from "@/components/drawing/canvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const DrawingWorkspace = () => {
  const [inputVal, setInputVal] = useState("");
  const params = useParams();
  const id = (params.id || "") as string;

  const [triggerSave, setTriggerSave] = useState(false);
  const [drawingData, setDrawingData] = useState<any>();
  console.log(id);
  useEffect(() => {
    id && getDrawingData();
  }, [id]);

  const getDrawingData = async () => {
    const { data, success } = await getByIdDrawingAction(id);
    console.log(data, success);
    if (success && data.length > 0) {
      setDrawingData(data[0]);
      setInputVal(data[0].name);
    } else {
      setDrawingData([]);
    }
  };

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
      <div className="h-[90vh]">
        <Canvas name={inputVal} triggerSave={triggerSave} drawingData={drawingData} />
      </div>
    </div>
  );
};

export default DrawingWorkspace;

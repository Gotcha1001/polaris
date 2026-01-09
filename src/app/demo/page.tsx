"use client";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader2Icon } from "lucide-react";

export default function DemoPage() {
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);

  const handleBlocking = async () => {
    setLoading(true);
    await axios.post("/api/demo/blocking");
    setLoading(false);
  };

  const handleBackground = async () => {
    setLoading2(true);
    await axios.post("/api/demo/background");
    setLoading2(false);
  };

  return (
    <div className="p-8 space-x-4">
      <Button disabled={loading} onClick={handleBlocking}>
        {loading ? <Loader2Icon className="animate-spin" /> : "Blocking"}
      </Button>
      <Button disabled={loading2} onClick={handleBackground}>
        {loading2 ? <Loader2Icon className="animate-spin" /> : "Background"}
      </Button>
    </div>
  );
}

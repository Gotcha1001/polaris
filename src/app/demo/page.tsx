"use client";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader2Icon } from "lucide-react";
import * as Sentry from "@sentry/nextjs";
import { useAuth } from "@clerk/nextjs";

export default function DemoPage() {
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);

  const { userId } = useAuth();

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

  // 1 Client error - throws in the browser
  const handleClientError = () => {
    Sentry.logger.info("User attempting to click on client function", {
      userId,
    });
    throw new Error("Client error: Something went wrong in the browser!");
  };

  // 2. API error - ttriggers server-side error
  const handleApiError = async () => {
    await axios.post("/api/demo/error");
  };

  //3 Inngest error - triggers error in background job
  const handleInngestError = async () => {
    await axios.post("/api/demo/inngest-error");
  };

  return (
    <div className="p-8 space-x-4">
      <Button disabled={loading} onClick={handleBlocking}>
        {loading ? <Loader2Icon className="animate-spin" /> : "Blocking"}
      </Button>
      <Button disabled={loading2} onClick={handleBackground}>
        {loading2 ? <Loader2Icon className="animate-spin" /> : "Background"}
      </Button>
      <Button variant={"destructive"} onClick={handleClientError}>
        Client Error
      </Button>
      <Button variant={"destructive"} onClick={handleApiError}>
        API Error
      </Button>
      <Button variant={"destructive"} onClick={handleInngestError}>
        Inngest Error
      </Button>
    </div>
  );
}

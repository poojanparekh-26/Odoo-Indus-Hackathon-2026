import { useState, useEffect } from "react";
import { getQueue, addToQueue, QueuedOperation } from "@/lib/offline/db";
import { syncQueue } from "@/lib/offline/sync";

export function useOfflineQueue() {
  const [queueSize, setQueueSize] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const updateSize = async () => {
    const queue = await getQueue();
    setQueueSize(queue.length);
  };

  useEffect(() => {
    updateSize();

    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === "QUEUE_OPERATION") {
        const op: QueuedOperation = { ...event.data.payload, retries: 0 };
        await addToQueue(op);
        await updateSize();
      }
    };

    const handleOnline = async () => {
      setIsSyncing(true);
      await syncQueue();
      await updateSize();
      setIsSyncing(false);
    };

    navigator.serviceWorker.addEventListener("message", handleMessage);
    window.addEventListener("online", handleOnline);

    return () => {
      navigator.serviceWorker.removeEventListener("message", handleMessage);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return { queueSize, isSyncing, refreshQueue: updateSize };
}

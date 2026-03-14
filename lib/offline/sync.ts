import { getQueue, removeFromQueue, updateQueueItem, QueuedOperation } from "./db";
import toast from "react-hot-toast";

export async function syncQueue() {
  const queue = await getQueue();
  if (queue.length === 0) return;

  console.log(`[Sync] Processing ${queue.length} queued operations...`);

  for (const op of queue) {
    try {
      const response = await fetch(op.url, {
        method: op.method,
        headers: op.headers,
        body: op.body
      });

      if (response.ok) {
        await removeFromQueue(op.id!);
        console.log(`[Sync] Successfully synced ${op.method} ${op.url}`);
      } else if (response.status >= 400 && response.status < 500) {
        // Permanent failure (e.g. 400 Bad Request, 403 Forbidden)
        await removeFromQueue(op.id!);
        const errorData = await response.json().catch(() => ({}));
        toast.error(`Sync failed: ${errorData.error || "Operation rejected by server"}`);
        console.error(`[Sync] Permanent failure for ${op.method} ${op.url}:`, errorData);
      } else {
        // Transient failure (5xx or other)
        await handleRetry(op);
      }
    } catch (error) {
      console.error(`[Sync] Network error for ${op.method} ${op.url}:`, error);
      await handleRetry(op);
    }
  }
}

async function handleRetry(op: QueuedOperation) {
  if (op.retries >= 3) {
    await removeFromQueue(op.id!);
    toast.error(`Sync failed after 3 retries: ${op.method} to ${new URL(op.url).pathname}`);
  } else {
    await updateQueueItem({ ...op, retries: op.retries + 1 });
  }
}

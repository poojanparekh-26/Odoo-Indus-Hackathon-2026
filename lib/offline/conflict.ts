import toast from "react-hot-toast";

interface Resource {
  updatedAt: string | Date;
  [key: string]: any;
}

export function resolveConflict(localTimestamp: number, serverValue: Resource) {
  const serverUpdatedAt = new Date(serverValue.updatedAt).getTime();

  if (serverUpdatedAt > localTimestamp) {
    toast.error(`Conflict detected! Server has a newer version. Overwriting local change.`);
    return {
      resolution: "server",
      value: serverValue
    };
  }

  return {
    resolution: "local",
    value: null
  };
}

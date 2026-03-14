import type { Server as SocketIOServer } from "socket.io";

declare global {
  // eslint-disable-next-line no-var
  var io: SocketIOServer | undefined;
}

export function getIO(): SocketIOServer {
  if (!global.io) {
    throw new Error("Socket.IO server has not been initialized.");
  }
  return global.io;
}

export function emitEvent(event: string, payload: unknown): void {
  try {
    const io = getIO();
    io.emit(event, payload);
  } catch (err) {
    console.warn("[socket] emitEvent called before server init:", err);
  }
}

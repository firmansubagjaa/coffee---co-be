import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { events } from "../../utils/events";

const realtime = new Hono();

realtime.get("/events", async (c) => {
  return streamSSE(c, async (stream) => {
    // Send initial connection message
    await stream.writeSSE({
      data: "Connected to Coffee & Co Realtime Stream",
      event: "connected",
    });

    // Listener for new orders
    const onNewOrder = async (order: any) => {
      await stream.writeSSE({
        data: JSON.stringify(order),
        event: "new_order",
      });
    };

    // Register listener
    events.on("new_order", onNewOrder);

    // Cleanup on disconnect
    stream.onAbort(() => {
      events.off("new_order", onNewOrder);
    });

    // Keep connection alive
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 10000));
      await stream.writeSSE({ data: "ping", event: "ping" });
    }
  });
});

export default realtime;

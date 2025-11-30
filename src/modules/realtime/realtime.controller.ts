import { OpenAPIHono } from "@hono/zod-openapi";
import { streamSSE } from "hono/streaming";

const realtime = new OpenAPIHono();

let clients: { id: number, controller: any }[] = [];

realtime.get('/', async (c) => {
  return streamSSE(c, async (stream) => {
    const id = Date.now();
    clients.push({ id, controller: stream });

    stream.onAbort(() => {
      clients = clients.filter(client => client.id !== id);
    });

    while (true) {
      await stream.sleep(1000); // Keep connection alive
    }
  });
});

export const broadcast = (event: string, data: any) => {
  clients.forEach(client => {
    client.controller.writeSSE({
      event,
      data: JSON.stringify(data),
    });
  });
};

export default realtime;

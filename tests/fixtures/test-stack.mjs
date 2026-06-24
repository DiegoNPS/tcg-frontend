import { createServer } from "node:http";

import next from "next";

const hostname = "127.0.0.1";
const frontendPort = 3100;
const backendPort = 3199;

process.env.BACKEND_URL = `http://${hostname}:${backendPort}`;
process.env.PLAYWRIGHT_TEST = "1";

const backend = createServer((request, response) => {
  response.setHeader("Content-Type", "application/json; charset=utf-8");

  if (request.url === "/__shutdown" && request.method === "POST") {
    response.writeHead(204);
    response.end();
    setImmediate(() => process.exit(0));
    return;
  }

  if (request.url?.startsWith("/api/auth/me")) {
    response.writeHead(401);
    response.end(JSON.stringify({ error: "No autenticado" }));
    return;
  }

  response.writeHead(200);
  response.end(JSON.stringify({ data: [] }));
});

backend.listen(backendPort, hostname);

const app = next({
  dev: true,
  dir: process.cwd(),
  hostname,
  port: frontendPort,
});

await app.prepare();

const frontend = createServer(app.getRequestHandler());
frontend.listen(frontendPort, hostname);

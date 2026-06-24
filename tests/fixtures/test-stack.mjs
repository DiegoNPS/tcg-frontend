import { createServer } from "node:http";

import next from "next";

const hostname = "127.0.0.1";
const frontendPort = 3100;
const backendPort = 3199;
const adminDashboard = {
  generatedAt: "2026-06-24T12:00:00.000Z",
  counts: { profiles: 428, tiendas: 37, torneos: 126, entries: 1842, juegos: 3 },
  attention: { draftTournaments: 2, profilesWithoutRole: 1 },
  juegos: [
    { id: "game-1", key: "pokemon", nombre: "Pokémon TCG", descripcion: "Juego de cartas coleccionables", created_at: "2026-06-01T12:00:00.000Z" },
  ],
  recentUsers: [
    { id: "11111111-1111-4111-8111-111111111111", email: "nuevo@example.com", created_at: "2026-06-24T10:00:00.000Z", email_confirmed_at: null, role: null },
    { id: "22222222-2222-4222-8222-222222222222", email: "jugador@example.com", created_at: "2026-06-23T10:00:00.000Z", email_confirmed_at: "2026-06-23T10:05:00.000Z", role: "jugador" },
  ],
  recentTorneos: [
    { id: "33333333-3333-4333-8333-333333333333", titulo: "Liga Pokémon Santiago", publicado: true, fecha_inicio: "2026-07-05T15:00:00.000Z", tienda_id: "store-1", tienda_nombre: "Arena TCG", ciudad: "Santiago" },
  ],
  draftTournaments: [
    { id: "44444444-4444-4444-8444-444444444444", titulo: "Commander Night", publicado: false, fecha_inicio: "2026-07-09T22:00:00.000Z", tienda_id: "store-2", tienda_nombre: "Mana Store", ciudad: "Providencia" },
  ],
  recentStores: [
    { id: "store-1", nombre: "Arena TCG", ciudad: "Santiago", owner_id: "owner-1", created_at: "2026-06-22T12:00:00.000Z" },
  ],
};

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
    const role = request.headers.cookie
      ?.split(";")
      .map((value) => value.trim())
      .find((value) => value.startsWith("e2e_role="))
      ?.split("=")[1];

    if (!role) {
      response.writeHead(401);
      response.end(JSON.stringify({ error: "No autenticado" }));
      return;
    }

    response.writeHead(200);
    response.end(JSON.stringify({
      data: {
        user: { id: `user-${role}`, email: `${role}@example.com` },
        profile: {
          display_name: role,
          user_role: role,
          created_at: "2026-01-01T00:00:00.000Z",
        },
        isTienda: role === "tienda",
      },
    }));
    return;
  }

  if (request.url?.startsWith("/api/admin/dashboard")) {
    response.writeHead(200);
    response.end(JSON.stringify({ data: adminDashboard }));
    return;
  }

  if (request.url?.startsWith("/api/admin/roles") && request.method === "POST") {
    response.writeHead(200);
    response.end(JSON.stringify({ data: { updated: true } }));
    return;
  }

  if (request.url?.startsWith("/api/admin/torneos/") && request.method === "PATCH") {
    response.writeHead(200);
    response.end(JSON.stringify({ data: { publicado: true } }));
    return;
  }

  if (request.url?.startsWith("/api/admin/juegos") && request.method === "POST") {
    response.writeHead(201);
    response.end(JSON.stringify({ data: { id: "game-new" } }));
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

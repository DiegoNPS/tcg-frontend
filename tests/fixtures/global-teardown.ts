export default async function globalTeardown() {
  await fetch("http://127.0.0.1:3199/__shutdown", {
    method: "POST",
  }).catch(() => undefined);
}

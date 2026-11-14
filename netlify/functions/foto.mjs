import { fotos } from "./lib/opslag.mjs";

export default async (req, context) => {
  const entry = await fotos().getWithMetadata(context.params.key, { type: "arrayBuffer" });
  if (entry === null) return new Response("Foto niet gevonden", { status: 404 });
  return new Response(entry.data, { headers: {
    "content-type": entry.metadata?.type || "image/jpeg",
    "cache-control": "public, max-age=31536000, immutable" } });
};
export const config = { path: "/foto/:key", method: "GET" };

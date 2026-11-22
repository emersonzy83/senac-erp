import { getStore } from "@netlify/blobs";

export default async (req) => {
  const store = getStore("senac-erp");
  const url = new URL(req.url);

  if (req.method === "GET") {
    const { blobs } = await store.list({ prefix: "company:" });
    const companies = (
      await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })))
    ).filter(Boolean);
    return Response.json({ companies });
  }

  if (req.method === "POST") {
    const body = await req.json();
    const company = body?.company;
    if (!company?.id) {
      return Response.json({ error: "Empresa inválida" }, { status: 400 });
    }
    await store.setJSON(`company:${company.id}`, company);
    return Response.json({ ok: true, id: company.id });
  }

  if (req.method === "DELETE") {
    const id = url.searchParams.get("id");
    if (!id) return Response.json({ error: "ID ausente" }, { status: 400 });
    await store.delete(`company:${id}`);
    return Response.json({ ok: true });
  }

  return new Response("Method not allowed", { status: 405 });
};

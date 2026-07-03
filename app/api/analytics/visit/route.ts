import { graphqlHttpUrlServer } from "@/lib/graphql-env";

export async function POST(request: Request) {
  let path = "/";
  try {
    const body = (await request.json()) as { path?: string };
    if (typeof body.path === "string" && body.path.trim()) {
      path = body.path.trim().slice(0, 512);
    }
  } catch {
    // Keep default path when body is missing or invalid.
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const userAgent = request.headers.get("user-agent");

  try {
    const res = await fetch(graphqlHttpUrlServer(), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(forwardedFor ? { "x-forwarded-for": forwardedFor } : {}),
        ...(realIp ? { "x-real-ip": realIp } : {}),
        ...(userAgent ? { "user-agent": userAgent } : {}),
      },
      body: JSON.stringify({
        query: `mutation RecordSiteVisit($path: String) { recordSiteVisit(path: $path) }`,
        variables: { path },
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      return new Response(null, { status: 204 });
    }

    const json = (await res.json()) as { errors?: unknown[] };
    if (json.errors?.length) {
      return new Response(null, { status: 204 });
    }

    return new Response(null, { status: 204 });
  } catch {
    return new Response(null, { status: 204 });
  }
}

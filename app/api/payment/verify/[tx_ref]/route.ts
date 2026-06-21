import { graphqlHttpUrlServer } from "@/lib/graphql-env";

function apiBaseFromGraphql(): string {
  return graphqlHttpUrlServer().replace(/\/graphql\/?$/i, "");
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ tx_ref: string }> },
) {
  const { tx_ref } = await context.params;
  const ref = decodeURIComponent(tx_ref ?? "").trim();
  if (!ref) {
    return Response.json(
      { status: "error", message: "Missing transaction reference." },
      { status: 400 },
    );
  }

  try {
    const upstream = await fetch(
      `${apiBaseFromGraphql()}/api/verify-payment/${encodeURIComponent(ref)}`,
      { method: "GET", cache: "no-store" },
    );
    const data = await upstream.json();
    return Response.json(data, { status: upstream.status });
  } catch {
    return Response.json(
      { status: "error", message: "Could not reach the payment server." },
      { status: 502 },
    );
  }
}

import { BUILD_INFO } from "@/lib/version";

// Built once per deploy, so it always describes what's live on the server —
// the app compares it with its own bundled BUILD_INFO to spot a newer deploy.
export const dynamic = "force-static";

export function GET() {
  return Response.json(BUILD_INFO, { headers: { "Cache-Control": "no-store, max-age=0" } });
}

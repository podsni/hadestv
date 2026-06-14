import { serve } from "bun";
import index from "./index.html";
import { getChannelCatalog } from "./server/iptvService";

const server = serve({
  port: Number(process.env.PORT ?? 3000),
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/channels": {
      async GET(req) {
        try {
          const url = new URL(req.url);
          const limit = Number(url.searchParams.get("limit") ?? 1200);
          const refresh = url.searchParams.get("refresh") === "1";
          const query = url.searchParams.get("query") ?? "";
          const payload = await getChannelCatalog({ limit, refresh, query });

          return Response.json(payload, {
            headers: {
              "Cache-Control": "public, max-age=300",
            },
          });
        } catch (error) {
          console.error("Failed to load channel catalog", error);
          return Response.json(
            {
              error: "CHANNEL_CATALOG_UNAVAILABLE",
              message: "Channel catalog is unavailable right now.",
            },
            { status: 502 },
          );
        }
      },
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);

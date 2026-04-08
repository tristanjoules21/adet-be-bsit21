import { Hono } from "hono";
import { serve } from "@hono/node-server";
import postRoutes from "./routes/post.route.js";

const app = new Hono();

app.route("/", postRoutes);

serve({
  fetch: app.fetch,
  port: 3000
});
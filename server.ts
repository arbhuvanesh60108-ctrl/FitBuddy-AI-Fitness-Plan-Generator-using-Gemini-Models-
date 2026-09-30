import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { handleApiRequest } from "./server/api-handler.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Forward API requests to the handler
app.use(async (req, res, next) => {
  if (
    req.url.startsWith("/api") ||
    req.url === "/generate-workout" ||
    req.url === "/submit-feedback"
  ) {
    const handled = await handleApiRequest(req, res);
    if (handled) return;
  }
  next();
});

// Serve static assets from dist
app.use(express.static(path.join(__dirname, "dist")));

// Fallback to index.html for SPA
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(port, () => {
  console.log(`FitBuddy server listening on port ${port}`);
});

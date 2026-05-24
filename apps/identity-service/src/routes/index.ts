import fs from "fs";
import path from "path";
import { Application } from "express";
import { initRouteEngine, registerModuleRoutes } from "./route.helper";
import { asyncHandler } from "../middleware/asyncHandler";

export const registerRoutes = (app: Application) => {
  initRouteEngine(app);

  // Static routes FIRST
  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/test-error", () => {
    throw new Error("Test error")
  })
  app.get(
  "/async-error",
  asyncHandler(async () => {
    throw new Error("Async error");
  })
);

  // Load all route files dynamically
  const routesPath = path.join(__dirname);

  const files = fs
    .readdirSync(routesPath)
    .filter(
      (file) =>
        file.endsWith(".route.ts") ||
        (file.endsWith(".route.js") && !file.includes(".map")),
    );
  for (const file of files) {
    const module = require(path.join(routesPath, file));

    const moduleConfig = module.default;

    const moduleName = file.replace(".route.ts", "").replace(".route.js", "");

    registerModuleRoutes(moduleName, moduleConfig);
  }
};

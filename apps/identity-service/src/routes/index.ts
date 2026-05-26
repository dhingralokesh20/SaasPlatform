import fs from "fs";
import path from "path";
import { Application } from "express";
import { initRouteEngine, registerModuleRoutes } from "./route.helper";

export const registerRoutes = (app: Application) => {
  initRouteEngine(app);

  // Static routes FIRST
  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

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

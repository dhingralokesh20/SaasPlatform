import { Application, RequestHandler } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { controllerRegistry } from "../controllers/controller.registry";
import { HttpMethod, ModuleRouteConfig } from "../types/route.types";

interface RouteDefinition {
  method: HttpMethod;
  handler: string;
  middleware?: RequestHandler[];
}

type RouteValue = RouteDefinition | RouteDefinition[];

const methodMap: Record<
  HttpMethod,
  (path: string, ...handlers: RequestHandler[]) => any
> = {
  get: (path, ...h) => app.get(path, ...h),
  post: (path, ...h) => app.post(path, ...h),
  put: (path, ...h) => app.put(path, ...h),
  delete: (path, ...h) => app.delete(path, ...h),
  patch: (path, ...h) => app.patch(path, ...h),
};

let app: Application;

export const initRouteEngine = (expressApp: Application) => {
  app = expressApp;
};

const isRouteDefinition = (value: unknown): value is RouteDefinition => {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    "method" in value &&
    "handler" in value
  );
};

const registerRoutes = (
  controller: any,
  routes: Record<string, unknown>,
  basePath: string,
  currentPath = "",
) => {
  Object.entries(routes).forEach(([key, value]) => {
    const routePath = `${currentPath}/${key}`;

    // Multiple HTTP methods on the same path
    if (Array.isArray(value)) {
      value.forEach((route) => {
        if (!isRouteDefinition(route)) {
          throw new Error(`Invalid route definition at "${routePath}"`);
        }

        const handler = controller[route.handler];

        if (typeof handler !== "function") {
          throw new Error(`Handler "${route.handler}" not found.`);
        }

        const fullPath = `${basePath}${routePath}`;

        const routeMethod = methodMap[route.method];

        routeMethod(
          fullPath,
          ...(route.middleware ?? []),
          asyncHandler(handler.bind(controller)),
        );
      });

      return;
    }

    if (isRouteDefinition(value)) {
      const handler = controller[value.handler];

      if (typeof handler !== "function") {
        throw new Error(`Handler "${value.handler}" not found.`);
      }

      const fullPath = `${basePath}${routePath}`;

      const routeMethod = methodMap[value.method];

      routeMethod(
        fullPath,
        ...(value.middleware ?? []),
        asyncHandler(handler.bind(controller)),
      );

      return;
    }

    registerRoutes(
      controller,
      value as Record<string, unknown>,
      basePath,
      routePath,
    );
  });
};

export const registerModuleRoutes = (
  moduleName: string,
  config: ModuleRouteConfig,
) => {
  const controller =
    controllerRegistry[moduleName as keyof typeof controllerRegistry];

  if (!controller) {
    throw new Error(`Controller group not found: ${moduleName}`);
  }

  registerRoutes(
    controller,
    config.routes as Record<string, unknown>,
    config.basePath,
  );
};

import { Application } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { controllerRegistry } from "../controllers/controller.registry";
import { HttpMethod, ModuleRouteConfig } from "../types/route.types";

const methodMap: Record<
  HttpMethod,
  (path: string, ...handlers: any[]) => any
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

export const registerModuleRoutes = (
  moduleName: string,
  config: ModuleRouteConfig
) => {
  const controllers =
    (controllerRegistry as any)[moduleName];

  if (!controllers) {
    throw new Error(`Controller group not found: ${moduleName}`);
  }

  Object.entries(config.routes).forEach(
    ([path, route]) => {
    const controllerHandler =
      controllers[route.handler];

    if (!controllerHandler) {
      throw new Error(
        `Handler "${route.handler}" not found in ${moduleName}`
      );
    }

    const handler =
      controllerHandler.bind(controllers);
      if (!handler) {
        throw new Error(
          `Handler "${route.handler}" not found in ${moduleName}`
        );
      }

    const normalizedPath =
      path.startsWith("/")
        ? path
        : `/${path}`;

    const fullPath =
      `${config.basePath}${normalizedPath}`;
      
      const middlewares = route.middleware || [];

      const routeMethod = methodMap[route.method];

      routeMethod(
        fullPath,
        ...middlewares,
        asyncHandler(handler)
      );
    }
  );
};
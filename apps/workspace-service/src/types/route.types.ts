export type HttpMethod = "get" | "post" | "put" | "delete" | "patch";

export type RouteDefinition = {
  method: HttpMethod;
  handler: string;
  middleware?: any[];
};

export type ModuleRouteConfig = {
  basePath: string;
  routes: Record<string, RouteDefinition>;
};
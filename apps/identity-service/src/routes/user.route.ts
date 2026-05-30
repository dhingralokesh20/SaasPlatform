import { AuthMiddleware } from "../middleware/auth.middleware";
// import { validate } from "../middleware/validate.middleware";

const UserRoutes = {
    basePath : "/user",
    routes: {
        current: {
            method: "get",
            handler: "getCurrentUser",
            middleware: [AuthMiddleware],
        }
    }
}

export default UserRoutes;
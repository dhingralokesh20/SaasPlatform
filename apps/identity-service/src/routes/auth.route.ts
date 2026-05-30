import { validate } from "../middleware/validate.middleware";
import { registerSchema } from "../validations/auth.validation";

const AuthRoutes = {
    basePath : "/auth",
    routes: {
        login: {
            method: "post",
            handler: "login",
            middleware: [],
        },
        register: {
            method: "post",
            handler: "register",
            middleware: [
                validate(registerSchema)
            ]
        },
        refreshToken: {
            method: "post",
            handler: "getNewRefreshToken"
        }
    }
}

export default AuthRoutes;
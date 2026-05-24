const AuthRoutes = {
    basePath : "/app",
    routes: {
        login: {
            method: "post",
            handler: "login",
            middleware: [],
        },
        register: {
            method: "post",
            handler: "register",
        },
        ":userId": {
            method: "get",
            handler: "getUserById"
        }

    }
}

export default AuthRoutes;
import express from "express";
import { registerRoutes } from "./routes";
import { errorMiddleware } from "./middleware/error.middleware";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

registerRoutes(app);

app.use(errorMiddleware);
export default app;

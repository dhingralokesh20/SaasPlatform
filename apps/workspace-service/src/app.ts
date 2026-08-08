import express from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { errorMiddleware } from "./middleware/error.middleware";
import cookieParser from "cookie-parser";
import { normalizeRequestMiddleware } from "./middleware/normalizeRequest.middleware";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:4200", "http://localhost"], // Angular dev server
    credentials: true, // IMPORTANT for cookies
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  }),
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(normalizeRequestMiddleware);
registerRoutes(app);

app.use(errorMiddleware);
export default app;

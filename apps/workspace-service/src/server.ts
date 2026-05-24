import express from "express";
import { db } from "./db";
import { redis } from "./redis";
const app = express();

app.get("/health", async(_, res) => {
    const result = await db.query("SELECT NOW()");

    res.json({servive: "workspace", db: "connected", time: result.rows[0] ,status: "ok"});
})

app.get("/redis", async(_req, res) => {
    await redis.set("ping", "pong");
    const value = await redis.get("ping")
    res.json({servive: "workspace", redis:"connected", value, status: "ok"});
})


app.listen(3002, () => {
    console.log("workspace Server running on 3002")
})


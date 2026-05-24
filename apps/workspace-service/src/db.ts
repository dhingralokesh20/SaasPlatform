import { Pool } from "pg";

export const db = new Pool({
    user: "postgres",
    password:"root",
    host:"localhost",
    port:5433,
    database:"worksphere"
})
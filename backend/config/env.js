import dotenv from "dotenv";

dotenv.config();

function required(name) {
  const v = process.env[name];
  if (v === undefined || v === null || v === "") {
    throw new Error(`Missing env var: ${name}`);
  }
  return v;
}

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || "development",

  db: {
    host: required("DB_HOST"),
    port: Number(process.env.DB_PORT || 3306),
    user: required("DB_USER"),
    password: process.env.DB_PASSWORD || "",
    database: required("DB_NAME")
  },

  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173"
};

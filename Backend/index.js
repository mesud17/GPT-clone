import dotenv from "dotenv/config";
import express from "express";
import db from "./db/db.config.js";
import mainRouter from "./src/api/main.route.js";
import errorHandler from "./src/middleware/error-handler.js";
import cors from "cors";
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", mainRouter);


app.use(errorHandler);
const getdata = async () => {
  try {
    const connection = await db.getConnection();
    connection.release();
    return console.log("database is connected");
  } catch (error) {
    console.error("Error connecting to database:", error);
  }
};
getdata();

app.listen(3777, () => {
  console.log("Server is running on port http://localhost:3777");
});

import express from "express";
import "dotenv/config";
import {authrouter, productosrouters } from "./routes";

const app = express();
app.set("json spaces", 2);
app.use(express.json());

app.use("/auth", authrouter);
app.use("/productos", productosrouters);

app.listen(3000, function () {
    console.log("Servidor listo");
});

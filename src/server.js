import express from "express";
import { authrouter } from "./routes/auth.routers.js";
import { productosrouter } from "./routes/productos.routers.js";

const app = express();
app.set("json spaces", 2);
app.use(express.json());

app.use(authrouter);
app.use(productosrouter);

app.listen(3000, function () {
    console.log("Servidor listo");
});

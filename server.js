import express from "express";
const app = express();
app.set("json spaces",2);
app.use(express.json());

let productos = [
    {id:1, nombre:"teclado", precio:80000, stock:10},
    {id:2, nombre:"mouse", precio:35000, stock:25},
    {id:3, nombre:"monitor", precio:650000, stock:8},
    {id:4, nombre:"portatil", precio:2500000, stock:5},
    {id:5, nombre:"audifonos", precio:120000, stock:15},
    {id:6, nombre:"impresora", precio:450000, stock:7},
    {id:7, nombre:"memoria USB", precio:25000, stock:30},
    {id:8, nombre:"disco duro externo", precio:280000, stock:12},
    {id:9, nombre:"webcam", precio:95000, stock:18},
    {id:10, nombre:"parlantes", precio:85000, stock:20},
    {id:11, nombre:"microfono", precio:150000, stock:9},
    {id:12, nombre:"tablet", precio:900000, stock:6},
    {id:13, nombre:"cargador", precio:45000, stock:22},
    {id:14, nombre:"alfombrilla mouse", precio:20000, stock:40},
    {id:15, nombre:"silla ergonomica", precio:750000, stock:4},
    {id:16, nombre:"router", precio:180000, stock:11},
    {id:17, nombre:"cable HDMI", precio:30000, stock:35},
    {id:18, nombre:"memoria RAM", precio:160000, stock:14},
    {id:19, nombre:"tarjeta grafica", precio:1800000, stock:3},
    {id:20, nombre:"ventilador USB", precio:40000, stock:16}
];


let siguienteid=3;
app.get("/productos", (req, res) => {
    res.status(200).json(productos);
});




app.get("/productos/:id", function (req, res) {
    const id = Number(req.params.id);

    let encontrado = null;
    for (let i = 0; i < productos.length; i++) {
        if (productos[i].id === id) {
            encontrado = productos[i];
        }
    }

    if (encontrado === null) {
        res.status(404).json({ mensaje: "Producto no encontrado" });
    } else {
        res.status(200).json(encontrado);
    }
});


app.post("/productos", (req, res) => {
    const {nombre, precio} =req.body;
    if (!nombre || precio === undefined) {
        return  res.status(400).json({error: "faltan datos"});
    }
    const nuevo= { id:siguienteid++, nombre, precio, stock: 0};
    productos.push(nuevo);
    res.status(201).json(nuevo);
});

app.delete("/productos/:id", (req, res)=> {
    const id= Number(req.params.id);
    const i = productos.findIndex((p)=> p.id===id);
    if (i ===-1) return res.status(404).json({error: "no existe"});
    productos.splice(i,1);
    res.status(204).end();
});
app.put("/productos/:id", (req, res) => {
    const id = Number(req.params.id);
    const { nombre, precio, stock } = req.body;
    const producto = productos.find(p => p.id === id);
    if (!producto) {
        return res.status(404).json({ error: "Producto no encontrado" });
    }
    producto.nombre = nombre ?? producto.nombre;
    producto.precio = precio ?? producto.precio;
    producto.stock = stock ?? producto.stock;
    res.status(200).json(producto);
});

app.patch("/productos/:id", (req, res) => {
    const id = Number(req.params.id);
    const producto = productos.find(p => p.id === id);
    if (!producto) {
        return res.status(404).json({ error: "Producto no encontrado" });
    }
    const { nombre, precio, stock } = req.body;
    if (nombre !== undefined) producto.nombre = nombre;
    if (precio !== undefined) producto.precio = precio;
    if (stock !== undefined) producto.stock = stock;
    res.status(200).json(producto);
});

app.listen(3000, () => console.log("servidor listo"));
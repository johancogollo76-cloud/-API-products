-- Active: 1794670659762@@127.0.0.1@3306@tienda
create database tienda;
use tienda;
create table productos (
    id int AUTO_INCREMENT primary key,
    nombre VARCHAR(100) NOT NULL,
    precio decimal (10,2) not null,
    stock int not null default 0
);

insert into productos (nombre, precio stock)
values ('teclado', 80000 ,10),

INSERT INTO productos (nombre, precio, stock) VALUES
('teclado', 80000, 10),
('mouse', 35000, 25),
('monitor', 650000, 8),
('portatil', 2500000, 5),
('audifonos', 120000, 15),
('impresora', 450000, 7),
('memoria USB', 25000, 30),
('disco duro externo', 280000, 12),
('webcam', 95000, 18),
('parlantes', 85000, 20),
('microfono', 150000, 9),
('tablet', 900000, 6),
('cargador', 45000, 22),
('alfombrilla mouse', 20000, 40),
('silla ergonomica', 750000, 4),
('router', 180000, 11),
('cable HDMI', 30000, 35),
('memoria RAM', 160000, 14),
('tarjeta grafica', 1800000, 3),
('ventilador USB', 40000, 16);

select * FROM productos;

create table usuarios (
    id int AUTO_INCREMENT primary key,
    email VARCHAR(100) not null unique,
    password varchar (100) not null,
    rol varchar(20) not null DEFAULT 'usuario'
);

ALTER TABLE usuarios CHANGE password password_hash VARCHAR(255) NOT NULL;
select * FROM usuarios;
-- password guarada el hash, nunca la clave 
-- await bcryp.hash(password,10)


UPDATE usuarios SET rol = 'admin' WHERE email = 'sebastian@gmail.com';
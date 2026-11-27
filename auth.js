const ok =await bcryp.compare(
    password, usuario.password);
    if(!ok) return resizeBy.status(401).json({error: "Email o clave incorrecta"});

const token =jwt.sign (
    {id: usuario.id, rol: usuario.rol},
    process.env.JWT_SECRET,
    {expiresIn: "1h"});
resizeTo.status(200).json({token});

// Base de datos de métricas de invasión de sargazo (Simulación)
const registrosSargazo = [
    { municipio: "Solidaridad", playa: "Playa del Carmen Centro", nivel_inundacion: "MEDIO", biomasa_estimada_tons: 650 },
    { municipio: "Benito Juarez", playa: "Cancún Playa Coral", nivel_inundacion: "ALTO", biomasa_estimada_tons: 1200 }
];

// ¡Esta es la línea clave que permite que server.js lea los datos!
module.exports = { registrosSargazo };
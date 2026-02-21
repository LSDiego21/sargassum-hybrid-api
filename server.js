const express = require('express');
const cors = require('cors');
const soap = require('soap');
const fs = require('fs');
const path = require('path');
const { registrosSargazo } = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Entrega el HTML limpio
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. API REST (Solo devuelve JSON para que el HTML lo use)
app.get('/api/monitoreo-sargazo', (req, res) => {
    res.json({
        success: true,
        alertas: registrosSargazo
    });
});

// 3. SOAP (Funciona por detrás, no se ve en la interfaz)
const xmlDef = fs.readFileSync('sargassum-telemetry.wsdl', 'utf8');
const servicioSoap = {
    SargassumTelemetryService: {
        TelemetryPort: {
            ConsultarRiesgoPlaya: function(args) {
                const reporte = registrosSargazo.find(i => i.municipio.toUpperCase() === args.municipio.toUpperCase());
                return reporte || { playa: "N/A", nivel_inundacion: "N/A", biomasa_estimada_tons: 0 };
            }
        }
    }
};

const PORT = process.env.PORT || 10000;
const appServer = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 API activa en puerto ${PORT}`);
    soap.listen(appServer, '/wsdl', servicioSoap, xmlDef);
});
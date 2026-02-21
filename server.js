const express = require('express');
const cors = require('cors');
const soap = require('soap');
const fs = require('fs');
const path = require('path'); // <-- Herramienta para leer tu página web
const { registrosSargazo } = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// 1. PÁGINA PRINCIPAL (El diseño visual)
// ==========================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ==========================================
// 2. ENDPOINT RESTful (Para JSON)
// ==========================================
app.get('/api/monitoreo-sargazo', (req, res) => {
    res.status(200).json({
        success: true,
        version_api: "1.0-REST",
        conteo_alertas: registrosSargazo.length,
        alertas: registrosSargazo
    });
});

// ==========================================
// 3. CONFIGURACIÓN SOAP (Para XML)
// ==========================================
const xmlDef = fs.readFileSync('sargassum-telemetry.wsdl', 'utf8');

const servicioSoapSargazo = {
    SargassumTelemetryService: {
        TelemetryPort: {
            ConsultarRiesgoPlaya: function(args) {
                const solicitud_municipio = args.municipio;
                const reporte = registrosSargazo.find(
                    item => item.municipio.toUpperCase() === solicitud_municipio.toUpperCase()
                );
                if (reporte) {
                    return { 
                        playa: reporte.playa, 
                        nivel_inundacion: reporte.nivel_inundacion, 
                        biomasa_estimada_tons: reporte.biomasa_estimada_tons 
                    };
                } else {
                    return { playa: "Desconocido", nivel_inundacion: "N/A", biomasa_estimada_tons: 0 };
                }
            }
        }
    }
};

// ==========================================
// 4. LEVANTAR EL SERVIDOR HÍBRIDO
// ==========================================
const PORT = process.env.PORT || 10000;

const appServer = app.listen(PORT, '0.0.0.0', function() {
    console.log(`✓ Servidor RESTful disponible globalmente en puerto: ${PORT}`);
    soap.listen(appServer, '/wsdl', servicioSoapSargazo, xmlDef);
    console.log(`✓ Interfaz SOAP y WSDL disponibles en la ruta: /wsdl?wsdl`);
}); 
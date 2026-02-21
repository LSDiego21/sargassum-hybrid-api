const express = require('express');
const cors = require('cors');
const soap = require('soap');
const fs = require('fs');
const { registrosSargazo } = require('./database');

const app = express();
app.use(cors()); // Habilita el intercambio de recursos [cite: 139]
app.use(express.json()); // Pipeline automático para entender JSON [cite: 140]

// ==========================================
// 1. ENDPOINT RESTful (Para JSON) [cite: 133]
// ==========================================
app.get('/api/monitoreo-sargazo', (req, res) => {
    // Retorna todos los registros de sargazo en formato ligero [cite: 141]
    res.status(200).json({
        success: true,
        version_api: "1.0-REST",
        conteo_alertas: registrosSargazo.length,
        alertas: registrosSargazo
    });
});

// ==========================================
// 2. CONFIGURACIÓN SOAP (Para XML) [cite: 148]
// ==========================================
// Carga el contrato WSDL que creamos en el paso anterior [cite: 167]
const xmlDef = fs.readFileSync('sargassum-telemetry.wsdl', 'utf8');

// Mapeo Funcional: Aquí definimos cómo responder a la petición SOAP [cite: 168]
const servicioSoapSargazo = {
    SargassumTelemetryService: {
        TelemetryPort: {
            ConsultarRiesgoPlaya: function(args) {
                const solicitud_municipio = args.municipio;
                
                // Busca el municipio en nuestra base de datos simulada
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
// 3. LEVANTAR EL SERVIDOR HÍBRIDO [cite: 174]
// ==========================================
// Usamos el puerto dinámico para la nube o el 10000 por defecto [cite: 174]
const PORT = process.env.PORT || 10000;

const appServer = app.listen(PORT, '0.0.0.0', function() {
    console.log(`✓ Servidor RESTful disponible globalmente en puerto: ${PORT}`);
    
    // Inyección Crítica: Escucha simultánea SOAP sobre el canal de Express
    soap.listen(appServer, '/wsdl', servicioSoapSargazo, xmlDef);
    console.log(`✓ Interfaz SOAP y WSDL disponibles en la ruta: /wsdl?wsdl`);
});
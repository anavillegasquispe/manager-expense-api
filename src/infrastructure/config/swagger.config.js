import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API de Gestión de Gastos e Ingresos",
            version: "1.0.0",
            description: "Documentación de la API para control de ingresos, egresos, presupuestos, monedas por fecha, reportes y auditorías"
        },
        servers: [
            { url: "http://localhost:3000/api/v1" }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            },
            // AVQ: esquemas y respuestas reutilizables
            schemas: {
                Error: {
                    type: "object",
                    properties: {
                        error: { type: "string", example: "Mensaje de error" }
                    }
                }
            },
            responses: {
                Unauthorized: {
                    description: "Token ausente, inválido o expirado",
                    content: { "application/json": { schema: { $ref: "#/components/schemas/Error" },
                        example: { error: "Falta el encabezado Authorization o no es válido" } } }
                },
                Forbidden: {
                    description: "El usuario no tiene el rol requerido",
                    content: { "application/json": { schema: { $ref: "#/components/schemas/Error" },
                        example: { error: "Prohibido: no tienes permisos suficientes" } } }
                }
            }
        },
        security: [{ bearerAuth: [] }]
    },
    apis: ["./src/presentation/routes/*.js"]
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log("Documentación Swagger disponible en http://localhost:3000/api-docs");
};


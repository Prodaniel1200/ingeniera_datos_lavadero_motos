# Riesgos y pendientes — priorizados para semanas 4 y 5

| Prioridad | Riesgo / pendiente | Impacto | Acción propuesta |
|---|---|---|---|
| Alta | ~51% de los registros del RAW se descartan por fecha o placa faltante | Reduce el volumen útil de análisis | Diseñar un formulario de captura con campos obligatorios (evita el error en la fuente) |
| Alta | El catálogo de precios está fijo en el código (hardcoded) | Si el lavadero sube precios, hay que tocar el script | Mover el catálogo de precios a un archivo de configuración/dimensión separada |
| Media | No hay dimensión de "empleado responsable del servicio" | No se puede medir productividad por empleado | Agregar el campo en la próxima captura de datos |
| Media | El modelo no diferencia clientes nuevos vs. recurrentes de forma explícita | Se infiere solo contando placas repetidas | Crear una dimensión CLIENTE con fecha de primera visita |
| Baja | No hay control de versiones de precios en el tiempo | Si el precio cambia a mitad de mes, el histórico se distorsiona | Añadir vigencia (fecha_inicio/fecha_fin) al catálogo de precios |

**Disponibilidad de datos**: por ahora el dataset es simulado; para las
semanas 4 y 5 se evaluará si se usa un registro real del negocio o se
continúa con datos simulados pero con reglas de generación más realistas.

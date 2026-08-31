# Mapa del viaje del dato — Lavadero de Motos

## Arquitectura por capas

```
[FUENTE]                [RAW]                    [STAGING]                 [ANALÍTICA]
Planilla del      →   servicios_raw.csv    →   servicios_staging.csv   →   analisis.py
lavadero              (copia exacta,           (datos limpios y            (respuestas a
(empleado anota       sin modificar,           validados según el         preguntas de
cada servicio)        con errores reales)      contrato)                  negocio)
```

| Capa | Función | Qué se conserva |
|---|---|---|
| **FUENTE** | Es el origen real del dato: el empleado que anota cada servicio prestado. | El proceso de captura (manual, propenso a error humano). |
| **RAW** | Copia fiel de lo que llegó, sin ninguna transformación. Es la evidencia original. | El archivo `data/raw/servicios_raw.csv` nunca se edita a mano; solo se lee. |
| **STAGING** | Aplica las reglas del contrato: limpia formatos, corrige o descarta filas inválidas. | El log de `clean_staging.py` documenta qué cambió y por qué (trazabilidad). |
| **Capa analítica** | Consume solo STAGING (nunca RAW) para responder preguntas de negocio. | Los resultados de `analisis.py`. |

## Por qué se conserva el RAW sin modificar
Si el dueño del lavadero pregunta "¿por qué esta placa no aparece en el
reporte?", se puede volver al RAW y comprobar si el dato llegó vacío o mal
escrito desde el origen, sin depender de la memoria de quien hizo la limpieza.
Esto es lo que garantiza la **trazabilidad**: cada número en la capa
analítica se puede rastrear hasta su origen y explicar qué transformación
sufrió en el camino.

## Riesgos de calidad identificados en la fuente
- Doble digitación de un mismo servicio (duplicados).
- Formatos de fecha inconsistentes (ISO vs DD/MM/AAAA) porque distintos
  empleados anotan distinto.
- Precios vacíos o negativos por error de digitación.
- Tipo de servicio escrito con mayúsculas/tildes inconsistentes o vacío.
- Placas sin registrar cuando el cliente tiene prisa.

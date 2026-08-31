# Contrato de datos y diccionario — Lavadero de Motos

## Diferencia entre contrato y diccionario
- **Diccionario de datos**: describe qué es cada campo (nombre, tipo, formato, ejemplo).
- **Contrato de datos**: además del significado, define las **reglas de calidad**
  que debe cumplir cada campo y **qué acción tomar** cuando una fila no las cumple.
  El contrato es el acuerdo entre quien produce el dato (el empleado del lavadero
  que registra el servicio) y quien lo consume (el proceso de limpieza y el dueño
  del negocio).

## Diccionario / contrato de campos (mínimo 5 campos requerido)

| Campo | Tipo | Formato | Regla de calidad | Ejemplo válido | Acción ante error |
|---|---|---|---|---|---|
| id_servicio | entero | autoincremental | debe ser único | 42 | descartar duplicado exacto |
| placa | texto | 6 caracteres alfanuméricos | no vacío, se normaliza a mayúsculas | ABC12D | si queda vacío tras normalizar, descartar fila |
| tipo_moto | texto | catálogo abierto | si falta, se asume "no_registrado" | scooter | reemplazar por "no_registrado" |
| tipo_servicio | texto | catálogo cerrado {basico, completo, encerado} | debe pertenecer al catálogo | completo | si no pertenece, marcar "sin_definir" y descartar en STAGING |
| precio | decimal | > 0, en pesos COP | no puede ser negativo ni vacío | 15000 | recalcular desde catálogo de precios según tipo_servicio; si no se puede inferir, descartar |
| fecha | fecha | ISO (AAAA-MM-DD) | debe ser una fecha válida | 2026-07-21 | intentar reparsear formato DD/MM/AAAA; si falla, descartar fila |

## Dimensiones de calidad aplicadas al dominio

| Dimensión | Definición aplicada al lavadero | Cómo se verifica |
|---|---|---|
| Completitud | Que no falten placa, precio, tipo de servicio o fecha | Conteo de nulos por campo en el perfilamiento del RAW |
| Validez | Que el tipo_servicio esté en el catálogo cerrado y el precio sea positivo | Reglas del contrato aplicadas en `clean_staging.py` |
| Unicidad | Que no existan filas duplicadas exactas para el mismo servicio | `drop_duplicates()` sobre el RAW |
| Consistencia | Que la placa y el tipo de servicio se escriban siempre en el mismo formato (mayúsculas, catálogo cerrado) | Normalización en STAGING |
| Oportunidad | Que la fecha del registro corresponda al período del corte (julio 2026) | Validación de rango de fechas al parsear |

## Responsabilidad y trazabilidad

| Rol | Responsable | Qué hace |
|---|---|---|
| Produce el dato | Empleado del lavadero (fuente) | Anota el servicio en la planilla/formulario |
| Transforma el dato | `src/clean_staging.py` | Limpia, normaliza y valida contra el contrato |
| Administra el dato | Repositorio del proyecto (carpetas `data/raw` y `data/staging`) | Conserva ambas versiones para auditoría |
| Consume el dato | `src/analisis.py` / dueño del lavadero | Responde las preguntas analíticas |

**Evidencia de cambios o errores**: cualquier corrección se hace únicamente en
`data/staging/`, nunca en `data/raw/`. El log impreso por `clean_staging.py`
(duplicados removidos, filas descartadas) es la evidencia verificable de qué
se corrigió y por qué.

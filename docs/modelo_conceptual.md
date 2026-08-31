# Modelo conceptual inicial — Lavadero de Motos

## Evento central del proceso
Un **servicio de lavado prestado a una moto** en una fecha determinada.

## Grano (unidad de análisis)
**Una fila = un servicio individual prestado a una moto en una fecha.**
El grano es inequívoco: no se agregan varios lavados en una sola fila, ni se
divide un lavado en varias filas.

## Preguntas analíticas que debe responder el modelo
1. ¿Cuál es el servicio más solicitado (básico, completo, encerado)?
2. ¿Qué día de la semana genera más ingresos?
3. ¿Cuál es el ingreso total y el ticket promedio del período?
4. ¿Qué motos/placas son clientes recurrentes?
5. ¿Qué tipo de moto genera más ingresos?

## Modelo dimensional (esquema estrella)

```
                     ┌───────────────────┐
                     │   DIM_FECHA       │
                     │ fecha (PK)        │
                     │ dia_semana        │
                     │ mes               │
                     └─────────┬─────────┘
                               │
┌───────────────────┐   ┌─────┴─────────────┐   ┌───────────────────┐
│  DIM_VEHICULO      │   │  HECHO_SERVICIO   │   │  DIM_TIPO_SERVICIO│
│ placa (PK)         │───│ id_servicio (PK)  │───│ tipo_servicio (PK)│
│ tipo_moto          │   │ placa (FK)        │   │ categoria         │
└───────────────────┘   │ fecha (FK)        │   └───────────────────┘
                         │ tipo_servicio (FK)│
                         │ precio (medida)   │
                         └───────────────────┘
```

## Hechos y dimensiones

| Elemento | Nombre | Atributos |
|---|---|---|
| **Hecho** | HECHO_SERVICIO | precio (medida numérica) |
| **Dimensión** | DIM_VEHICULO | placa, tipo_moto |
| **Dimensión** | DIM_FECHA | fecha, día de la semana, mes |
| **Dimensión** | DIM_TIPO_SERVICIO | tipo_servicio, categoría/precio base |

Este modelo responde directamente las 5 preguntas analíticas: cada una se
resuelve agrupando el hecho `HECHO_SERVICIO` por una o más dimensiones
(ver `src/analisis.py`).

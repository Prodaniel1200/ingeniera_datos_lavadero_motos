# Proyecto integrador — Lavadero de Motos

Avance del proyecto correspondiente a la Semana 3 (Taller Primer Corte —
Ingeniería de Datos, Componente 3).

## Problema y dominio
Un lavadero de motos registra manualmente cada servicio prestado (lavado
básico, completo o encerado) en una planilla física. El dueño no tiene
forma sencilla de saber qué servicio es más rentable, qué días generan más
ingresos ni cuáles son sus clientes recurrentes. El proyecto construye la
base de datos y el modelo analítico para responder esas preguntas.

- **Consumidor principal**: dueño del lavadero.
- **Alcance de este corte**: un mes de servicios (julio 2026), datos
  simulados con errores realistas de captura manual.

## Estructura del repositorio

```
lavadero-motos/
├── data/
│   ├── raw/servicios_raw.csv          # Fuente original, nunca se modifica
│   └── staging/servicios_staging.csv  # Datos limpios y validados
├── src/
│   ├── generar_raw.py     # Simula la fuente original (se corre una sola vez)
│   ├── clean_staging.py   # RAW -> STAGING según el contrato de datos
│   └── analisis.py        # Capa analítica: responde las preguntas de negocio
├── docs/
│   ├── contrato_diccionario.md   # Contrato de datos y diccionario (Componente 2)
│   ├── mapa_viaje_dato.md        # Arquitectura por capas y trazabilidad
│   ├── modelo_conceptual.md      # Modelo dimensional (hechos y dimensiones)
│   └── riesgos_pendientes.md     # Riesgos priorizados para semanas 4 y 5
└── README.md
```

## Cómo ejecutar
```bash
pip install pandas
python3 src/generar_raw.py      # genera data/raw/servicios_raw.csv
python3 src/clean_staging.py    # genera data/staging/servicios_staging.csv
python3 src/analisis.py         # imprime las respuestas analíticas
```

### Regenerar el informe (.docx)
El informe formal (`Informe_Proyecto_Lavadero_Motos.docx`) se genera con Node.js
a partir de `src/generar_informe.js`:
```bash
npm install
node src/generar_informe.js     # o: npm run informe
```

## Resultados del corte (evidencia de ejecución)
- Registros en RAW: 186
- Duplicados exactos removidos: 6
- Registros descartados por datos no recuperables: 95
- Registros válidos en STAGING: 85
- Servicio más solicitado: **completo** (36 servicios)
- Ingreso total del mes: **$1.310.000**
- Ticket promedio: **$15.412**

## Conclusiones técnicas
- Conservar el RAW sin modificar permitió detectar que más de la mitad de
  los registros originales tenían problemas de completitud (fecha o placa
  faltante), lo que es información valiosa para el dueño del negocio: el
  problema no es de análisis, es de captura de datos en el origen.
- Definir un contrato de datos ANTES de programar la limpieza evitó decisiones
  ad-hoc dentro del código: cada regla de `clean_staging.py` está justificada
  en `docs/contrato_diccionario.md`.
- El riesgo principal identificado para el resto del semestre es mejorar la
  forma de captura en la fuente, no seguir "parchando" en STAGING.

Ver `docs/riesgos_pendientes.md` para el detalle priorizado.

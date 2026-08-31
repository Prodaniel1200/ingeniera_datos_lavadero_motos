const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, ShadingType, AlignmentType, BorderStyle, PageBreak, Header, Footer,
  PageNumber, NumberFormat
} = require("docx");
const fs = require("fs");
const path = require("path");

// Se guarda en la raíz del repositorio sin importar desde dónde se ejecute el script
const RUTA_SALIDA = path.join(__dirname, "..", "Informe_Proyecto_Lavadero_Motos.docx");

const AZUL = "1F4E79";
const GRIS_CLARO = "F2F2F2";

function celda(texto, opts = {}) {
  return new TableCell({
    width: { size: opts.width || 2000, type: WidthType.DXA },
    shading: opts.header ? { type: ShadingType.CLEAR, fill: AZUL } : undefined,
    children: [new Paragraph({
      children: [new TextRun({ text: texto, bold: !!opts.header, color: opts.header ? "FFFFFF" : "000000", size: 20 })],
    })],
  });
}

function filaTabla(celdas, anchos, header = false) {
  return new TableRow({
    children: celdas.map((c, i) => celda(c, { width: anchos[i], header })),
  });
}

function tabla(headers, filas, anchos) {
  return new Table({
    width: { size: anchos.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: anchos,
    rows: [filaTabla(headers, anchos, true), ...filas.map(f => filaTabla(f, anchos))],
  });
}

function h1(texto) {
  return new Paragraph({ text: texto, heading: HeadingLevel.HEADING_1, spacing: { before: 300, after: 150 } });
}
function h2(texto) {
  return new Paragraph({ text: texto, heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } });
}
function p(texto, opts = {}) {
  return new Paragraph({ children: [new TextRun({ text: texto, ...opts })], spacing: { after: 150 } });
}
function bullet(texto) {
  return new Paragraph({ text: texto, bullet: { level: 0 }, spacing: { after: 80 } });
}

const doc = new Document({
  sections: [
    // ---------- PORTADA ----------
    {
      properties: { page: { size: { width: 12240, height: 15840 } } },
      children: [
        new Paragraph({ text: "", spacing: { before: 2000 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "UNIVERSIDAD CATÓLICA DE COLOMBIA", bold: true, size: 32 })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Facultad de Ingeniería", size: 26 })],
          spacing: { before: 100, after: 600 },
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Fundamentos, Arquitectura y Modelado Inicial", bold: true, size: 30 })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Avance del Proyecto Integrador — Semana 3", size: 26 })],
          spacing: { before: 100, after: 100 },
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Dominio: Lavadero de Motos", italics: true, size: 24 })],
          spacing: { after: 1200 },
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Curso: Ingeniería de Datos", size: 22 })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Docente: Diego Iván Oliveros Acosta", size: 22 })],
          spacing: { after: 800 },
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Edwin Alejandro López Montero", size: 22 })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Bogotá D.C., Colombia — 2026", size: 22 })],
          spacing: { before: 800 },
        }),
        new Paragraph({ children: [new PageBreak()] }),

        // ---------- INTRODUCCIÓN ----------
        h1("Introducción"),
        p("Este documento presenta el avance del proyecto integrador correspondiente al primer corte del curso de Ingeniería de Datos. El dominio seleccionado por el equipo es un lavadero de motos, un negocio que registra manualmente cada servicio prestado y que hoy no cuenta con una forma sencilla de analizar sus ingresos, sus servicios más solicitados ni sus clientes recurrentes."),
        p("El avance reutiliza y consolida las evidencias construidas durante las semanas 1 a 3: definición del problema, mapa del viaje del dato, contrato y diccionario de datos, arquitectura por capas y el modelo conceptual inicial que orientará el resto del semestre."),

        // ---------- OBJETIVOS ----------
        h1("Objetivos"),
        h2("Objetivo general"),
        p("Construir la base de un producto de datos para un lavadero de motos, estableciendo el problema, la arquitectura por capas, el contrato de datos y el modelo conceptual inicial, con evidencia verificable de código, transformación y análisis."),
        h2("Objetivos específicos"),
        bullet("Caracterizar el problema, la fuente y los consumidores del dominio del lavadero de motos."),
        bullet("Diseñar el mapa del viaje del dato entre la fuente, la capa RAW, la capa STAGING y la capa analítica."),
        bullet("Definir un contrato de datos y un diccionario que garanticen la calidad de la información."),
        bullet("Construir un modelo conceptual dimensional (hechos y dimensiones) que responda las preguntas analíticas del negocio."),
        bullet("Documentar los riesgos y pendientes que orientarán las semanas 4 y 5 del proyecto."),

        // ---------- 1. PROBLEMA Y DOMINIO ----------
        h1("1. Problema y dominio"),
        p("Un lavadero de motos registra en una planilla física cada servicio prestado (lavado básico, completo o encerado). El dueño del negocio no tiene forma sencilla de saber qué servicio es más rentable, qué días de la semana generan más ingresos, ni cuáles son sus clientes recurrentes. El problema es concreto y analizable con datos: se resuelve construyendo un flujo que capture, limpie y analice los registros de servicios."),
        p("Consumidor principal: el dueño del lavadero, interesado en decisiones sobre precios, horarios de mayor demanda y fidelización de clientes."),
        p("Alcance de este corte: un mes de servicios (julio de 2026). Los datos son simulados, pero replican errores reales de captura manual (duplicados, formatos de fecha inconsistentes, precios vacíos o inválidos, placas mal escritas)."),

        // ---------- 2. MAPA DEL VIAJE DEL DATO ----------
        h1("2. Mapa del viaje del dato y arquitectura por capas"),
        p("La arquitectura se organiza en cuatro capas, tal como se describe a continuación:"),
        tabla(
          ["Capa", "Función", "Qué se conserva"],
          [
            ["FUENTE", "Empleado del lavadero anota cada servicio prestado.", "El proceso de captura manual, propenso a error humano."],
            ["RAW", "Copia fiel de lo que llegó, sin transformación alguna.", "servicios_raw.csv nunca se edita a mano; solo se lee."],
            ["STAGING", "Aplica las reglas del contrato: limpia, corrige o descarta filas inválidas.", "El log de ejecución documenta qué cambió y por qué."],
            ["Analítica", "Consume solo STAGING para responder preguntas de negocio.", "Resultados reproducibles con evidencia de ejecución."],
          ],
          [1800, 4600, 3200]
        ),
        p(""),
        p("Conservar el RAW sin modificar permite responder, ante cualquier duda del dueño del negocio, por qué un registro no aparece en el reporte final: se puede volver al origen y comprobar si el dato llegó vacío o mal escrito, garantizando trazabilidad completa entre la fuente y el resultado analítico."),
        h2("Riesgos de calidad identificados en la fuente"),
        bullet("Doble digitación de un mismo servicio (duplicados)."),
        bullet("Formatos de fecha inconsistentes (ISO vs. DD/MM/AAAA) según el empleado que registra."),
        bullet("Precios vacíos o negativos por error de digitación."),
        bullet("Tipo de servicio escrito con mayúsculas, tildes o vacíos inconsistentes."),
        bullet("Placas sin registrar cuando el cliente tiene prisa."),

        // ---------- 3. CONTRATO Y DICCIONARIO ----------
        h1("3. Contrato de datos y diccionario"),
        p("El diccionario de datos describe qué es cada campo (nombre, tipo, formato, ejemplo). El contrato de datos añade las reglas de calidad que debe cumplir cada campo y la acción a tomar cuando una fila no las cumple. Es el acuerdo entre quien produce el dato (el empleado del lavadero) y quien lo consume (el proceso de limpieza y el dueño del negocio)."),
        tabla(
          ["Campo", "Tipo", "Formato", "Regla", "Ejemplo", "Acción ante error"],
          [
            ["id_servicio", "entero", "autoincremental", "único", "42", "descartar duplicado"],
            ["placa", "texto", "6 caract. alfanum.", "no vacío, mayúsculas", "ABC12D", "descartar si queda vacía"],
            ["tipo_moto", "texto", "catálogo abierto", "si falta, valor por defecto", "scooter", "usar \"no_registrado\""],
            ["tipo_servicio", "texto", "catálogo cerrado", "básico/completo/encerado", "completo", "marcar \"sin_definir\""],
            ["precio", "decimal", "> 0, en COP", "no negativo ni vacío", "15000", "recalcular desde catálogo"],
            ["fecha", "fecha", "ISO AAAA-MM-DD", "fecha válida", "2026-07-21", "reparsear o descartar"],
          ],
          [1600, 1000, 1800, 1900, 1300, 2200]
        ),
        p(""),
        h2("Dimensiones de calidad aplicadas"),
        tabla(
          ["Dimensión", "Definición aplicada", "Cómo se verifica"],
          [
            ["Completitud", "Que no falten placa, precio, tipo de servicio o fecha.", "Conteo de nulos en el perfilamiento del RAW."],
            ["Validez", "Tipo de servicio en catálogo cerrado y precio positivo.", "Reglas del contrato en la transformación."],
            ["Unicidad", "No existen filas duplicadas exactas.", "Eliminación de duplicados sobre el RAW."],
            ["Consistencia", "Placa y tipo de servicio en formato uniforme.", "Normalización en STAGING."],
            ["Oportunidad", "La fecha corresponde al período del corte.", "Validación de rango de fechas al parsear."],
          ],
          [1800, 4400, 3400]
        ),
        p(""),
        h2("Responsabilidad y trazabilidad"),
        tabla(
          ["Rol", "Responsable", "Qué hace"],
          [
            ["Produce el dato", "Empleado del lavadero", "Anota el servicio en la planilla."],
            ["Transforma el dato", "Proceso de limpieza (STAGING)", "Limpia, normaliza y valida contra el contrato."],
            ["Administra el dato", "Repositorio del proyecto", "Conserva RAW y STAGING para auditoría."],
            ["Consume el dato", "Dueño del lavadero", "Usa las respuestas de la capa analítica."],
          ],
          [2200, 3200, 4200]
        ),

        // ---------- 4. MODELO CONCEPTUAL ----------
        new Paragraph({ children: [new PageBreak()] }),
        h1("4. Modelo conceptual inicial"),
        p("Evento central del proceso: un servicio de lavado prestado a una moto en una fecha determinada."),
        p("Grano (unidad de análisis): una fila representa un servicio individual prestado a una moto en una fecha. El grano es inequívoco: no se agregan varios lavados en una fila ni se divide un lavado en varias."),
        h2("Preguntas analíticas que responde el modelo"),
        bullet("¿Cuál es el servicio más solicitado (básico, completo, encerado)?"),
        bullet("¿Qué día de la semana genera más ingresos?"),
        bullet("¿Cuál es el ingreso total y el ticket promedio del período?"),
        bullet("¿Qué motos o placas son clientes recurrentes?"),
        bullet("¿Qué tipo de moto genera más ingresos?"),
        h2("Hechos y dimensiones (esquema estrella)"),
        tabla(
          ["Elemento", "Nombre", "Atributos"],
          [
            ["Hecho", "HECHO_SERVICIO", "precio (medida numérica)"],
            ["Dimensión", "DIM_VEHICULO", "placa, tipo_moto"],
            ["Dimensión", "DIM_FECHA", "fecha, día de la semana, mes"],
            ["Dimensión", "DIM_TIPO_SERVICIO", "tipo_servicio, categoría / precio base"],
          ],
          [1800, 3600, 4200]
        ),
        p(""),
        p("Este modelo responde directamente las cinco preguntas analíticas: cada una se resuelve agrupando el hecho HECHO_SERVICIO por una o más dimensiones."),

        // ---------- 5. IMPLEMENTACIÓN Y EVIDENCIA ----------
        h1("5. Implementación y evidencia de ejecución"),
        p("El flujo se implementó en Python (pandas) con tres scripts reproducibles: generación de la fuente simulada, limpieza RAW → STAGING y capa analítica. El repositorio conserva ambos archivos de datos (RAW y STAGING) para trazabilidad completa."),
        tabla(
          ["Indicador", "Valor"],
          [
            ["Registros en RAW", "186"],
            ["Duplicados exactos removidos", "6"],
            ["Registros descartados (datos no recuperables)", "95"],
            ["Registros válidos en STAGING", "85"],
            ["Servicio más solicitado", "completo (36 servicios)"],
            ["Ingreso total del mes", "$1.310.000"],
            ["Ticket promedio", "$15.412"],
          ],
          [5600, 4000]
        ),
        p(""),
        p("El alto número de registros descartados (95 de 186) no se interpreta como un fallo del proceso de limpieza, sino como un hallazgo relevante para el negocio: el problema principal no está en el análisis sino en la captura de datos en el origen."),

        // ---------- 6. RIESGOS Y PENDIENTES ----------
        h1("6. Riesgos y pendientes priorizados"),
        tabla(
          ["Prioridad", "Riesgo / pendiente", "Acción propuesta"],
          [
            ["Alta", "~51% de los registros se descartan por fecha o placa faltante.", "Diseñar un formulario de captura con campos obligatorios."],
            ["Alta", "El catálogo de precios está fijo en el código.", "Moverlo a una dimensión o archivo de configuración."],
            ["Media", "No existe dimensión de empleado responsable.", "Agregar el campo en la próxima captura de datos."],
            ["Media", "No se diferencia explícitamente cliente nuevo vs. recurrente.", "Crear dimensión CLIENTE con fecha de primera visita."],
            ["Baja", "No hay control de vigencia de precios en el tiempo.", "Añadir fecha_inicio/fecha_fin al catálogo de precios."],
          ],
          [1400, 4600, 3600]
        ),

        // ---------- 7. CONCLUSIONES ----------
        h1("7. Conclusiones"),
        h2("Conclusiones técnicas individuales"),
        p("Conservar el RAW sin modificar permitió detectar que más de la mitad de los registros originales tenían problemas de completitud (fecha o placa faltante), lo que constituye información valiosa para el dueño del negocio: el problema no es de análisis sino de captura de datos en el origen."),
        p("Definir el contrato de datos antes de programar la limpieza evitó decisiones ad-hoc dentro del código: cada regla aplicada en la transformación está justificada en el documento de contrato y diccionario."),
        h2("Conclusiones grupales"),
        p("El equipo decidió mantener el mismo dominio (lavadero de motos) desde la semana 1 para conservar trazabilidad entre el problema, las fuentes, las transformaciones y las decisiones tomadas. El riesgo priorizado para las semanas 4 y 5 es mejorar la forma de captura en la fuente, en lugar de seguir corrigiendo errores únicamente en la capa STAGING."),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(RUTA_SALIDA, buffer);
  console.log(`Documento generado en ${RUTA_SALIDA}`);
});

"""
Genera los diagramas del proyecto a partir de código (no se dibujan a mano):

1. docs/img/arquitectura_capas.png -> FUENTE -> RAW -> STAGING -> ANALÍTICA -> CONSUMO
2. docs/img/modelo_estrella.png    -> HECHO_SERVICIO con sus tres dimensiones

Las tablas y campos del modelo estrella son los mismos de docs/modelo_conceptual.md.
Si el modelo cambia, se actualiza el diccionario MODELO y se vuelve a ejecutar el script.
"""
from pathlib import Path

import matplotlib
matplotlib.use("Agg")  # dibuja en archivo, sin abrir ventanas
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch

# Rutas construidas desde la ubicación del script: funciona desde cualquier carpeta
RAIZ = Path(__file__).resolve().parent.parent
CARPETA_SALIDA = RAIZ / "docs" / "img"

AZUL_OSCURO = "#1F4E79"
AZUL_MEDIO = "#2E75B6"
GRIS_BORDE = "#404040"

CAPAS = [
    ("FUENTE", "Empleado registra\ncada servicio\nen la planilla"),
    ("RAW", "servicios_raw.csv\ncopia exacta,\nnunca se modifica"),
    ("STAGING", "servicios_staging.csv\nlimpio según el\ncontrato de datos"),
    ("ANALÍTICA", "analisis.py\nmodelo estrella\n(hechos y dimensiones)"),
    ("CONSUMO", "Dueño del lavadero\nrespuestas a las\npreguntas de negocio"),
]

MODELO = {
    "HECHO_SERVICIO": ["id_servicio (PK)", "placa (FK)", "fecha (FK)", "tipo_servicio (FK)", "precio (medida)"],
    "DIM_VEHICULO": ["placa (PK)", "tipo_moto"],
    "DIM_FECHA": ["fecha (PK)", "dia_semana", "mes"],
    "DIM_TIPO_SERVICIO": ["tipo_servicio (PK)", "categoria / precio base"],
}


def dibujar_caja(ax, x, y, ancho, alto, titulo, texto, color_titulo):
    """Dibuja una caja con una franja de título y el texto debajo. (x, y) es la esquina inferior izquierda."""
    ax.add_patch(FancyBboxPatch((x, y), ancho, alto, boxstyle="round,pad=0,rounding_size=0.08",
                                facecolor="white", edgecolor=GRIS_BORDE, linewidth=1.2))
    alto_titulo = 0.45
    ax.add_patch(FancyBboxPatch((x, y + alto - alto_titulo), ancho, alto_titulo,
                                boxstyle="round,pad=0,rounding_size=0.08",
                                facecolor=color_titulo, edgecolor=GRIS_BORDE, linewidth=1.2))
    ax.text(x + ancho / 2, y + alto - alto_titulo / 2, titulo, ha="center", va="center",
            color="white", fontsize=10, fontweight="bold")
    ax.text(x + ancho / 2, y + (alto - alto_titulo) / 2, texto, ha="center", va="center",
            fontsize=8.5, linespacing=1.4)


def dibujar_flecha(ax, x1, y1, x2, y2):
    """Flecha de (x1, y1) a (x2, y2)."""
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle="-|>", color=GRIS_BORDE, lw=1.4))


def diagrama_arquitectura(ruta):
    """Cinco capas de izquierda a derecha, unidas por flechas."""
    ancho, alto, separacion = 2.4, 2.0, 0.6
    fig, ax = plt.subplots(figsize=(13, 3.4))
    for i, (titulo, texto) in enumerate(CAPAS):
        x = i * (ancho + separacion)
        color = AZUL_OSCURO if titulo in ("RAW", "STAGING") else AZUL_MEDIO
        dibujar_caja(ax, x, 0, ancho, alto, titulo, texto, color)
        if i < len(CAPAS) - 1:
            dibujar_flecha(ax, x + ancho + 0.05, alto / 2, x + ancho + separacion - 0.05, alto / 2)
    total = len(CAPAS) * ancho + (len(CAPAS) - 1) * separacion
    ax.set_xlim(-0.2, total + 0.2)
    ax.set_ylim(-0.3, alto + 0.7)
    ax.text(total / 2, alto + 0.4, "Arquitectura por capas — Lavadero de Motos",
            ha="center", fontsize=12, fontweight="bold", color=AZUL_OSCURO)
    ax.axis("off")
    fig.savefig(ruta, dpi=200, bbox_inches="tight", facecolor="white")
    plt.close(fig)


def diagrama_estrella(ruta):
    """La tabla de hechos al centro y cada dimensión conectada a ella."""
    ancho = 3.0

    def alto_de(tabla):
        return 0.45 + 0.32 * len(MODELO[tabla]) + 0.2

    posiciones = {  # esquina inferior izquierda de cada tabla
        "HECHO_SERVICIO": (3.5, 2.6),
        "DIM_VEHICULO": (0.0, 5.0),
        "DIM_FECHA": (7.0, 5.0),
        "DIM_TIPO_SERVICIO": (3.5, 0.0),
    }
    fig, ax = plt.subplots(figsize=(9, 7.5))

    # primero las líneas, para que queden detrás de las cajas
    hx, hy = posiciones["HECHO_SERVICIO"]
    centro_hecho = (hx + ancho / 2, hy + alto_de("HECHO_SERVICIO") / 2)
    for tabla, (x, y) in posiciones.items():
        if tabla != "HECHO_SERVICIO":
            ax.plot([x + ancho / 2, centro_hecho[0]], [y + alto_de(tabla) / 2, centro_hecho[1]],
                    color=GRIS_BORDE, lw=1.2, zorder=0)

    for tabla, (x, y) in posiciones.items():
        color = AZUL_OSCURO if tabla.startswith("HECHO") else AZUL_MEDIO
        texto = "\n".join(MODELO[tabla])
        dibujar_caja(ax, x, y, ancho, alto_de(tabla), tabla, texto, color)

    ax.set_xlim(-0.3, 10.3)
    ax.set_ylim(-0.3, 7.4)
    ax.text(5.0, 7.1, "Modelo conceptual inicial — Esquema de estrella",
            ha="center", fontsize=12, fontweight="bold", color=AZUL_OSCURO)
    ax.axis("off")
    fig.savefig(ruta, dpi=200, bbox_inches="tight", facecolor="white")
    plt.close(fig)


def main():
    CARPETA_SALIDA.mkdir(parents=True, exist_ok=True)
    salidas = {
        "arquitectura_capas.png": diagrama_arquitectura,
        "modelo_estrella.png": diagrama_estrella,
    }
    for nombre, funcion in salidas.items():
        ruta = CARPETA_SALIDA / nombre
        funcion(ruta)
        print(f"Diagrama generado: {ruta.relative_to(RAIZ)}")


if __name__ == "__main__":
    main()

"""
Genera el archivo RAW (fuente original) del lavadero de motos.
Este script se corre UNA sola vez para simular la planilla del negocio.
El CSV resultante en data/raw/ NUNCA se modifica manualmente después:
representa "lo que llegó" del mundo real, con errores incluidos.
"""
import csv
import random
from datetime import date, timedelta

random.seed(42)

tipos_servicio = ["basico", "Básico", "completo", "Completo", "encerado", "ENCERADO", ""]
tipo_moto = ["deportiva", "trabajo", "scooter", "cilindraje alto", ""]
precios_por_tipo = {"basico": 8000, "completo": 15000, "encerado": 22000}

placas_frecuentes = ["ABC12D", "XYZ34E", "JKL56F", "MNO78G"]

filas = []
fecha_inicio = date(2026, 7, 1)

for i in range(1, 181):
    fecha = fecha_inicio + timedelta(days=random.randint(0, 30))
    # formatos de fecha inconsistentes (error típico de captura manual)
    formato_fecha = random.choice(["iso", "dmy", "vacio"])
    if formato_fecha == "iso":
        fecha_str = fecha.isoformat()
    elif formato_fecha == "dmy":
        fecha_str = fecha.strftime("%d/%m/%Y")
    else:
        fecha_str = ""

    # placas: a veces repetidas (clientes frecuentes), a veces mal escritas, a veces vacías
    if random.random() < 0.3:
        placa = random.choice(placas_frecuentes)
    else:
        placa = f"{random.choice('ABCDEFGHJ')}{random.choice('ABCDEFGHJ')}{random.choice('ABCDEFGHJ')}{random.randint(10,99)}{random.choice('ABCDEFGHJ')}"
    if random.random() < 0.08:
        placa = placa.lower()  # inconsistencia de mayúsculas
    if random.random() < 0.04:
        placa = ""  # dato faltante

    tipo = random.choice(tipos_servicio)
    tipo_norm = tipo.strip().lower()
    precio_base = precios_por_tipo.get(tipo_norm, None)

    if precio_base is None:
        precio = ""  # servicio vacío -> precio vacío
    else:
        precio = precio_base
        if random.random() < 0.05:
            precio = -precio  # precio inválido (negativo)
        if random.random() < 0.05:
            precio = ""  # precio faltante

    moto = random.choice(tipo_moto)

    filas.append({
        "id_servicio": i,
        "placa": placa,
        "tipo_moto": moto,
        "tipo_servicio": tipo,
        "precio": precio,
        "fecha": fecha_str,
    })

# duplicar algunos registros a propósito (error real: doble digitación)
for _ in range(6):
    filas.append(dict(random.choice(filas)))

with open("data/raw/servicios_raw.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["id_servicio", "placa", "tipo_moto", "tipo_servicio", "precio", "fecha"])
    writer.writeheader()
    writer.writerows(filas)

print(f"Generados {len(filas)} registros en data/raw/servicios_raw.csv")

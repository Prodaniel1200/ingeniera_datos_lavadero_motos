"""
Capa analítica: consume data/staging/servicios_staging.csv (nunca el RAW)
y responde las preguntas analíticas definidas en docs/modelo_conceptual.md
"""
import pandas as pd

df = pd.read_csv("data/staging/servicios_staging.csv")
df["fecha"] = pd.to_datetime(df["fecha"])
df["dia_semana"] = df["fecha"].dt.day_name()

print("=== 1. Servicio más solicitado ===")
print(df["tipo_servicio"].value_counts())

print("\n=== 2. Ingresos totales por día de la semana ===")
print(df.groupby("dia_semana")["precio"].sum().sort_values(ascending=False))

print("\n=== 3. Ingreso total del mes ===")
print(f"${df['precio'].sum():,}")

print("\n=== 4. Ticket promedio por servicio ===")
print(f"${df['precio'].mean():,.0f}")

print("\n=== 5. Motos / placas más frecuentes (clientes recurrentes) ===")
print(df["placa"].value_counts().head(5))

print("\n=== 6. Ingresos por tipo de moto ===")
print(df.groupby("tipo_moto")["precio"].sum().sort_values(ascending=False))

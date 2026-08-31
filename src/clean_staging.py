"""
Transforma data/raw/servicios_raw.csv -> data/staging/servicios_staging.csv

Reglas aplicadas (ver docs/contrato_diccionario.md):
1. placa: normalizar a mayúsculas, sin espacios; vacía -> se marca inválida
2. tipo_servicio: normalizar a minúsculas sin tildes/espacios; catálogo cerrado
   {basico, completo, encerado}; fuera de catálogo o vacío -> "sin_definir"
3. precio: debe ser > 0; si es vacío o negativo, se recalcula desde el catálogo
   de precios según tipo_servicio; si no se puede inferir, se descarta la fila
4. fecha: normalizar a formato ISO (AAAA-MM-DD); admite entrada ISO o DD/MM/AAAA;
   si no se puede parsear, se descarta la fila
5. duplicados exactos: se eliminan, conservando solo la primera ocurrencia
6. el archivo RAW original NUNCA se modifica; este script solo LEE de raw/
"""
import pandas as pd
from datetime import datetime

PRECIOS_CATALOGO = {"basico": 8000, "completo": 15000, "encerado": 22000}

df = pd.read_csv("data/raw/servicios_raw.csv", dtype=str)
total_raw = len(df)

# --- Regla 5: quitar duplicados exactos ---
df = df.drop_duplicates()
duplicados_removidos = total_raw - len(df)

# --- Regla 1: normalizar placa ---
df["placa"] = df["placa"].fillna("").str.strip().str.upper()

# --- Regla 2: normalizar tipo_servicio ---
def normalizar_tipo(t):
    if pd.isna(t):
        return "sin_definir"
    t = t.strip().lower().replace("á", "a").replace("é", "e")
    return t if t in PRECIOS_CATALOGO else "sin_definir"

df["tipo_servicio"] = df["tipo_servicio"].apply(normalizar_tipo)

# --- Regla 3: recalcular precio si falta o es inválido ---
def corregir_precio(row):
    try:
        p = float(row["precio"])
    except (ValueError, TypeError):
        p = None
    if p is None or p <= 0:
        return PRECIOS_CATALOGO.get(row["tipo_servicio"], None)
    return p

df["precio"] = df.apply(corregir_precio, axis=1)

# --- Regla 4: normalizar fecha a ISO ---
def normalizar_fecha(f):
    if pd.isna(f) or str(f).strip() == "":
        return None
    f = str(f).strip()
    for fmt in ("%Y-%m-%d", "%d/%m/%Y"):
        try:
            return datetime.strptime(f, fmt).date().isoformat()
        except ValueError:
            continue
    return None

df["fecha"] = df["fecha"].apply(normalizar_fecha)

filas_antes_filtro = len(df)

# --- Descartar filas que quedaron sin poder completarse (placa, precio o fecha) ---
df_valido = df[
    (df["placa"] != "") &
    (df["precio"].notna()) &
    (df["fecha"].notna()) &
    (df["tipo_servicio"] != "sin_definir")
].copy()

filas_descartadas = filas_antes_filtro - len(df_valido)

df_valido["precio"] = df_valido["precio"].astype(int)
df_valido["tipo_moto"] = df_valido["tipo_moto"].fillna("no_registrado").replace("", "no_registrado")

df_valido = df_valido[["id_servicio", "placa", "tipo_moto", "tipo_servicio", "precio", "fecha"]]
df_valido.to_csv("data/staging/servicios_staging.csv", index=False)

# --- Perfilamiento básico / diagnóstico ---
print("=== Diagnóstico RAW -> STAGING ===")
print(f"Registros en RAW:              {total_raw}")
print(f"Duplicados exactos removidos:  {duplicados_removidos}")
print(f"Registros descartados (datos no recuperables): {filas_descartadas}")
print(f"Registros válidos en STAGING:  {len(df_valido)}")
print()
print("Distribución por tipo_servicio (STAGING):")
print(df_valido["tipo_servicio"].value_counts())

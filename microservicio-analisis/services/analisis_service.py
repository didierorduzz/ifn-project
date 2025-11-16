import requests
from config import Config
import pandas as pd
import numpy as np

class AnalisisService:
    @staticmethod
    def obtener_datos_mongodb():
        """Obtener datos del backend principal (MongoDB)"""
        try:
            # Obtener muestras
            muestras_response = requests.get(f"{Config.NODE_BACKEND_URL}/api/muestras")
            muestras = muestras_response.json() if muestras_response.status_code == 200 else []
            
            # Obtener árboles
            arboles_response = requests.get(f"{Config.NODE_BACKEND_URL}/api/arboles")
            arboles = arboles_response.json() if arboles_response.status_code == 200 else []
            
            # Obtener conglomerados
            conglomerados_response = requests.get(f"{Config.NODE_BACKEND_URL}/api/conglomerados")
            conglomerados = conglomerados_response.json() if conglomerados_response.status_code == 200 else []
            
            return {
                'muestras': muestras,
                'arboles': arboles,
                'conglomerados': conglomerados
            }
        except Exception as e:
            print(f"Error al obtener datos: {e}")
            return None
    
    @staticmethod
    def analizar_distribucion_especies():
        """Analizar distribución de especies forestales"""
        datos = AnalisisService.obtener_datos_mongodb()
        if not datos or not datos['arboles']:
            return None
        
        df = pd.DataFrame(datos['arboles'])
        
        # Contar especies
        distribucion = df['especie'].value_counts().to_dict()
        
        # Calcular estadísticas
        total_arboles = len(df)
        especies_unicas = df['especie'].nunique()
        
        # Top 5 especies
        top_especies = df['especie'].value_counts().head(5).to_dict()
        
        return {
            'total_arboles': total_arboles,
            'especies_unicas': especies_unicas,
            'distribucion_completa': distribucion,
            'top_5_especies': top_especies
        }
    
    @staticmethod
    def analizar_condicion_arboles():
        """Analizar condición sanitaria de los árboles"""
        datos = AnalisisService.obtener_datos_mongodb()
        if not datos or not datos['arboles']:
            return None
        
        df = pd.DataFrame(datos['arboles'])
        
        # Distribución por condición
        condiciones = df['condicion'].value_counts().to_dict()
        
        # Distribución por estado sanitario
        sanitario = df['sanitario'].value_counts().to_dict() if 'sanitario' in df.columns else {}
        
        return {
            'total': len(df),
            'por_condicion': condiciones,
            'por_estado_sanitario': sanitario
        }
    
    @staticmethod
    def analizar_muestras_por_tipo():
        """Analizar distribución de muestras por tipo"""
        datos = AnalisisService.obtener_datos_mongodb()
        if not datos or not datos['muestras']:
            return None
        
        df = pd.DataFrame(datos['muestras'])
        
        # Distribución por tipo
        tipos = df['tipo'].value_counts().to_dict()
        
        # Distribución por estado
        estados = df['estado'].value_counts().to_dict() if 'estado' in df.columns else {}
        
        # Distribución por condición
        condiciones = df['condicion'].value_counts().to_dict() if 'condicion' in df.columns else {}
        
        return {
            'total_muestras': len(df),
            'por_tipo': tipos,
            'por_estado': estados,
            'por_condicion': condiciones
        }
    
    @staticmethod
    def analizar_dap_altura():
        """Análisis estadístico de DAP y altura"""
        datos = AnalisisService.obtener_datos_mongodb()
        if not datos or not datos['arboles']:
            return None
        
        df = pd.DataFrame(datos['arboles'])
        
        # Estadísticas de DAP
        dap_stats = {
            'promedio': float(df['dap'].mean()),
            'mediana': float(df['dap'].median()),
            'minimo': float(df['dap'].min()),
            'maximo': float(df['dap'].max()),
            'desviacion_std': float(df['dap'].std())
        }
        
        # Estadísticas de altura
        altura_stats = {
            'promedio': float(df['altura'].mean()),
            'mediana': float(df['altura'].median()),
            'minimo': float(df['altura'].min()),
            'maximo': float(df['altura'].max()),
            'desviacion_std': float(df['altura'].std())
        }
        
        # Clasificación de árboles por DAP
        clasificacion_dap = {
            'pequeño (<15cm)': int((df['dap'] < 15).sum()),
            'mediano (15-30cm)': int(((df['dap'] >= 15) & (df['dap'] < 30)).sum()),
            'grande (30-60cm)': int(((df['dap'] >= 30) & (df['dap'] < 60)).sum()),
            'muy_grande (>=60cm)': int((df['dap'] >= 60).sum())
        }
        
        return {
            'dap': dap_stats,
            'altura': altura_stats,
            'clasificacion_dap': clasificacion_dap,
            'total_analizado': len(df)
        }
    
    @staticmethod
    def generar_resumen_general():
        """Generar resumen general del inventario"""
        datos = AnalisisService.obtener_datos_mongodb()
        if not datos:
            return None
        
        resumen = {
            'conglomerados': {
                'total': len(datos['conglomerados']),
                'por_departamento': {}
            },
            'arboles': {
                'total': len(datos['arboles']),
                'especies_unicas': 0
            },
            'muestras': {
                'total': len(datos['muestras']),
                'pendientes': 0,
                'procesadas': 0
            }
        }
        
        # Análisis de conglomerados por departamento
        if datos['conglomerados']:
            df_cong = pd.DataFrame(datos['conglomerados'])
            resumen['conglomerados']['por_departamento'] = df_cong['departamento'].value_counts().to_dict()
        
        # Análisis de árboles
        if datos['arboles']:
            df_arb = pd.DataFrame(datos['arboles'])
            resumen['arboles']['especies_unicas'] = df_arb['especie'].nunique()
        
        # Análisis de muestras
        if datos['muestras']:
            df_mues = pd.DataFrame(datos['muestras'])
            if 'estado' in df_mues.columns:
                estados = df_mues['estado'].value_counts().to_dict()
                resumen['muestras']['pendientes'] = estados.get('Pendiente', 0)
                resumen['muestras']['procesadas'] = estados.get('Procesado', 0)
        
        return resumen
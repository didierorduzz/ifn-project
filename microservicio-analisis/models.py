from database import db
from datetime import datetime
import json

class AnalisisReporte:
    @staticmethod
    def crear(tipo_reporte, titulo, descripcion, parametros, resultado, generado_por):
        query = """
        INSERT INTO analisis_reportes (tipo_reporte, titulo, descripcion, parametros, resultado, generado_por)
        VALUES (:tipo, :titulo, :desc, :params, :res, :gen)
        """
        
        params_json = json.dumps(parametros) if parametros else None
        resultado_json = json.dumps(resultado) if resultado else None
        
        db.execute_query(query, {
            'tipo': tipo_reporte,
            'titulo': titulo,
            'desc': descripcion,
            'params': params_json,
            'res': resultado_json,
            'gen': generado_por
        })
    
    @staticmethod
    def obtener_todos(limit=50):
        query = """
        SELECT id, tipo_reporte, titulo, descripcion, parametros, resultado, generado_por,
               TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at
        FROM analisis_reportes
        ORDER BY created_at DESC
        FETCH FIRST :limit ROWS ONLY
        """
        return db.fetch_all(query, {'limit': limit})
    
    @staticmethod
    def obtener_por_tipo(tipo_reporte, limit=20):
        query = """
        SELECT id, tipo_reporte, titulo, descripcion, parametros, resultado, generado_por,
               TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at
        FROM analisis_reportes
        WHERE tipo_reporte = :tipo
        ORDER BY created_at DESC
        FETCH FIRST :limit ROWS ONLY
        """
        return db.fetch_all(query, {'tipo': tipo_reporte, 'limit': limit})
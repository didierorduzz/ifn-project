import cx_Oracle
from config import Config

class Database:
    def __init__(self):
        self.pool = None
        self.connect()
    
    def connect(self):
        try:
            self.pool = cx_Oracle.SessionPool(
                user=Config.ORACLE_USER,
                password=Config.ORACLE_PASSWORD,
                dsn=Config.ORACLE_DSN,
                min=2,
                max=10,
                increment=1,
                encoding="UTF-8"
            )
            print("✅ Oracle DB conectado correctamente")
        except cx_Oracle.Error as e:
            print(f"❌ Error al conectar Oracle: {e}")
            raise
    
    def get_connection(self):
        return self.pool.acquire()
    
    def release_connection(self, connection):
        self.pool.release(connection)
    
    def execute_query(self, query, params=None):
        connection = self.get_connection()
        cursor = connection.cursor()
        try:
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            connection.commit()
            return cursor
        except Exception as e:
            connection.rollback()
            raise e
        finally:
            cursor.close()
            self.release_connection(connection)
    
    def fetch_all(self, query, params=None):
        connection = self.get_connection()
        cursor = connection.cursor()
        try:
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            
            # Obtener nombres de columnas
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()
            
            # Convertir a lista de diccionarios
            return [dict(zip(columns, row)) for row in rows]
        finally:
            cursor.close()
            self.release_connection(connection)
    
    def fetch_one(self, query, params=None):
        connection = self.get_connection()
        cursor = connection.cursor()
        try:
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            
            columns = [col[0] for col in cursor.description]
            row = cursor.fetchone()
            
            if row:
                return dict(zip(columns, row))
            return None
        finally:
            cursor.close()
            self.release_connection(connection)
    
    def create_tables(self):
        """Crear tablas necesarias para análisis"""
        create_table_query = """
        BEGIN
            EXECUTE IMMEDIATE '
                CREATE TABLE analisis_reportes (
                    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                    tipo_reporte VARCHAR2(100) NOT NULL,
                    titulo VARCHAR2(255) NOT NULL,
                    descripcion CLOB,
                    parametros CLOB,
                    resultado CLOB,
                    generado_por VARCHAR2(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ';
        EXCEPTION
            WHEN OTHERS THEN
                IF SQLCODE != -955 THEN
                    RAISE;
                END IF;
        END;
        """
        
        try:
            self.execute_query(create_table_query)
            print("✅ Tablas de análisis creadas correctamente")
        except Exception as e:
            print(f"⚠️ Tablas ya existentes o error: {e}")

# Instancia global
db = Database()
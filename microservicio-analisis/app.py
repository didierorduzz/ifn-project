import datetime
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from config import Config
from database import db
from models import AnalisisReporte
from services.analisis_service import AnalisisService
from services.pdf_service import PDFService

app = Flask(__name__)
CORS(app)

# Crear tablas al iniciar
db.create_tables()

@app.route('/health', methods=['GET'])
def health():
    """Endpoint para verificar que el servicio está funcionando"""
    return jsonify({
        'status': 'ok',
        'service': 'Microservicio de Análisis',
        'version': '1.0.0',
        'database': 'Oracle'
    }), 200

@app.route('/api/analisis/especies', methods=['GET'])
def analizar_especies():
    """Analizar distribución de especies"""
    try:
        resultado = AnalisisService.analizar_distribucion_especies()
        
        if resultado:
            # Guardar en Oracle
            AnalisisReporte.crear(
                tipo_reporte='distribucion_especies',
                titulo='Análisis de Distribución de Especies',
                descripcion='Análisis estadístico de la distribución de especies forestales',
                parametros={},
                resultado=resultado,
                generado_por='sistema'
            )
        
        return jsonify({
            'success': True,
            'data': resultado
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analisis/condicion-arboles', methods=['GET'])
def analizar_condicion():
    """Analizar condición de árboles"""
    try:
        resultado = AnalisisService.analizar_condicion_arboles()
        
        if resultado:
            AnalisisReporte.crear(
                tipo_reporte='condicion_arboles',
                titulo='Análisis de Condición de Árboles',
                descripcion='Distribución de árboles por condición y estado sanitario',
                parametros={},
                resultado=resultado,
                generado_por='sistema'
            )
        
        return jsonify({
            'success': True,
            'data': resultado
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analisis/muestras', methods=['GET'])
def analizar_muestras():
    """Analizar muestras por tipo"""
    try:
        resultado = AnalisisService.analizar_muestras_por_tipo()
        
        if resultado:
            AnalisisReporte.crear(
                tipo_reporte='analisis_muestras',
                titulo='Análisis de Muestras',
                descripcion='Distribución de muestras por tipo, estado y condición',
                parametros={},
                resultado=resultado,
                generado_por='sistema'
            )
        
        return jsonify({
            'success': True,
            'data': resultado
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analisis/dap-altura', methods=['GET'])
def analizar_dap_altura():
    """Análisis estadístico de DAP y altura"""
    try:
        resultado = AnalisisService.analizar_dap_altura()
        
        if resultado:
            AnalisisReporte.crear(
                tipo_reporte='dap_altura',
                titulo='Análisis de DAP y Altura',
                descripcion='Estadísticas de diámetro a la altura del pecho y altura total',
                parametros={},
                resultado=resultado,
                generado_por='sistema'
            )
        
        return jsonify({
            'success': True,
            'data': resultado
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analisis/resumen-general', methods=['GET'])
def resumen_general():
    """Generar resumen general"""
    try:
        resultado = AnalisisService.generar_resumen_general()
        
        if resultado:
            AnalisisReporte.crear(
                tipo_reporte='resumen_general',
                titulo='Resumen General del Inventario',
                descripcion='Vista general de todos los datos del inventario forestal',
                parametros={},
                resultado=resultado,
                generado_por='sistema'
            )
        
        return jsonify({
            'success': True,
            'data': resultado
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reportes/historial', methods=['GET'])
def obtener_historial():
    """Obtener historial de reportes generados"""
    try:
        tipo = request.args.get('tipo')
        limit = int(request.args.get('limit', 50))
        
        if tipo:
            reportes = AnalisisReporte.obtener_por_tipo(tipo, limit)
        else:
            reportes = AnalisisReporte.obtener_todos(limit)
        
        return jsonify({
            'success': True,
            'total': len(reportes),
            'reportes': reportes
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reportes/pdf/especies', methods=['GET'])
def generar_pdf_especies():
    """Generar PDF de reporte de especies"""
    try:
        datos = AnalisisService.analizar_distribucion_especies()
        
        if not datos:
            return jsonify({'error': 'No hay datos disponibles'}), 404
        
        pdf_buffer = PDFService.generar_reporte_especies(datos)
        
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'reporte_especies_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf'
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reportes/pdf/general', methods=['GET'])
def generar_pdf_general():
    """Generar PDF de resumen general"""
    try:
        from datetime import datetime
        datos = AnalisisService.generar_resumen_general()
        
        if not datos:
            return jsonify({'error': 'No hay datos disponibles'}), 404
        
        pdf_buffer = PDFService.generar_reporte_general(datos)
        
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'resumen_general_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf'
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print(f"🚀 Microservicio de Análisis iniciando en puerto {Config.FLASK_PORT}")
    print(f"📊 Conectado a Oracle Database")
    app.run(host='0.0.0.0', port=Config.FLASK_PORT, debug=True)
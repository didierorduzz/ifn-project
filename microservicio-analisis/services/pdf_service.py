from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from datetime import datetime
import io

class PDFService:
    @staticmethod
    def generar_reporte_especies(datos_analisis):
        """Generar PDF con reporte de especies"""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        elementos = []
        
        # Estilos
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#57c27a'),
            spaceAfter=30,
            alignment=TA_CENTER
        )
        
        # Título
        elementos.append(Paragraph("Reporte de Distribución de Especies", title_style))
        elementos.append(Spacer(1, 0.3*inch))
        
        # Información general
        info_text = f"""
        <b>Fecha de generación:</b> {datetime.now().strftime('%d/%m/%Y %H:%M')}<br/>
        <b>Total de árboles analizados:</b> {datos_analisis['total_arboles']}<br/>
        <b>Especies únicas identificadas:</b> {datos_analisis['especies_unicas']}<br/>
        """
        elementos.append(Paragraph(info_text, styles['Normal']))
        elementos.append(Spacer(1, 0.3*inch))
        
        # Tabla de Top 5 especies
        elementos.append(Paragraph("<b>Top 5 Especies Más Comunes</b>", styles['Heading2']))
        
        tabla_data = [['Especie', 'Cantidad', 'Porcentaje']]
        total = datos_analisis['total_arboles']
        
        for especie, cantidad in datos_analisis['top_5_especies'].items():
            porcentaje = (cantidad / total) * 100
            tabla_data.append([especie, str(cantidad), f"{porcentaje:.2f}%"])
        
        tabla = Table(tabla_data, colWidths=[3*inch, 1.5*inch, 1.5*inch])
        tabla.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#57c27a')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        elementos.append(tabla)
        
        # Construir PDF
        doc.build(elementos)
        buffer.seek(0)
        return buffer
    
    @staticmethod
    def generar_reporte_general(resumen):
        """Generar PDF con resumen general"""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        elementos = []
        
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#57c27a'),
            spaceAfter=30,
            alignment=TA_CENTER
        )
        
        # Título
        elementos.append(Paragraph("Resumen General del Inventario Forestal", title_style))
        elementos.append(Spacer(1, 0.3*inch))
        
        # Fecha
        fecha = datetime.now().strftime('%d/%m/%Y %H:%M')
        elementos.append(Paragraph(f"<b>Generado el:</b> {fecha}", styles['Normal']))
        elementos.append(Spacer(1, 0.3*inch))
        
        # Conglomerados
        elementos.append(Paragraph("<b>CONGLOMERADOS</b>", styles['Heading2']))
        cong_text = f"Total de conglomerados registrados: {resumen['conglomerados']['total']}"
        elementos.append(Paragraph(cong_text, styles['Normal']))
        elementos.append(Spacer(1, 0.2*inch))
        
        # Árboles
        elementos.append(Paragraph("<b>ÁRBOLES</b>", styles['Heading2']))
        arb_text = f"""
        Total de árboles: {resumen['arboles']['total']}<br/>
        Especies únicas: {resumen['arboles']['especies_unicas']}
        """
        elementos.append(Paragraph(arb_text, styles['Normal']))
        elementos.append(Spacer(1, 0.2*inch))
        
        # Muestras
        elementos.append(Paragraph("<b>MUESTRAS</b>", styles['Heading2']))
        mues_text = f"""
        Total de muestras: {resumen['muestras']['total']}<br/>
        Muestras pendientes: {resumen['muestras']['pendientes']}<br/>
        Muestras procesadas: {resumen['muestras']['procesadas']}
        """
        elementos.append(Paragraph(mues_text, styles['Normal']))
        
        # Construir PDF
        doc.build(elementos)
        buffer.seek(0)
        return buffer
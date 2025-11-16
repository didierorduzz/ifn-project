# Plan de Testing Manual

## Test 1: Autenticación

### Caso 1.1: Login Exitoso (Admin)
1. Acceder a http://localhost:3000/login
2. Ingresar: admin@ifn.com / admin123
3. **Resultado esperado**: Redirección a /admin

### Caso 1.2: Login Exitoso (Brigadista)
1. Acceder a http://localhost:3000/login
2. Ingresar: demo@ifn.com / demo123
3. **Resultado esperado**: Redirección a /brigadista

### Caso 1.3: Login Fallido
1. Acceder a http://localhost:3000/login
2. Ingresar credenciales incorrectas
3. **Resultado esperado**: Mensaje de error

## Test 2: Registro de Datos (Brigadista)

### Caso 2.1: Registrar Conglomerado
1. Login como brigadista
2. Ir a "Registrar Conglomerado"
3. Completar formulario:
   - Código: CG-0001
   - Departamento: Santander
   - Municipio: Bucaramanga
   - Coordenadas: 7.1254, -73.1198
4. **Resultado esperado**: Conglomerado guardado, aparece en tabla

### Caso 2.2: Registrar Subparcela
1. Ir a "Registrar Subparcela"
2. Completar formulario:
   - Conglomerado: CG-0001
   - Número: 1
   - Coordenadas: 7.1255, -73.1199
3. **Resultado esperado**: Subparcela guardada

### Caso 2.3: Registrar Árbol
1. Ir a "Registrar Árbol"
2. Completar formulario:
   - Subparcela: SP-0001
   - Código: AR-0001
   - DAP: 25.5
   - Altura: 15.2
4. **Resultado esperado**: Árbol guardado

### Caso 2.4: Registrar Muestra
1. Ir a "Registrar Muestra"
2. Completar formulario:
   - Árbol: AR-0001
   - Código: MS-0001
   - Tipo: Hoja
3. **Resultado esperado**: Muestra guardada

## Test 3: Microservicio de Análisis

### Caso 3.1: Análisis de Especies
1. Login como admin
2. Ir a "Estadísticas"
3. Verificar sección "Distribución de Especies"
4. **Resultado esperado**: Muestra estadísticas correctas

### Caso 3.2: Descargar PDF
1. En Estadísticas
2. Click "Descargar Reporte de Especies"
3. **Resultado esperado**: Se descarga PDF

### Caso 3.3: Verificar Oracle
```sql
-- Conectar a Oracle
sqlplus ifn_oracle/oracle123@localhost:1521/XEPDB1

-- Verificar registros
SELECT COUNT(*) FROM analisis_reportes;
```
**Resultado esperado**: Debe haber al menos 1 registro

## Test 4: Microservicio de Zonas

### Caso 4.1: Crear Zona
1. Login como admin
2. Ir a "Gestión de Zonas"
3. Click en el mapa
4. Completar formulario
5. **Resultado esperado**: Zona guardada, aparece en mapa

### Caso 4.2: Verificar en Oracle
```sql
SELECT * FROM zonas;
```
**Resultado esperado**: Zona aparece en la tabla

### Caso 4.3: Ver Zonas (Brigadista)
1. Login como brigadista
2. Ir a "Zonas Asignadas"
3. **Resultado esperado**: Mapa muestra todas las zonas

## Test 5: Exportación de Datos

### Caso 5.1: Exportar CSV (Brigadista)
1. Ir a "Mis Reportes"
2. Click "Exportar CSV"
3. **Resultado esperado**: Se descarga archivo CSV

### Caso 5.2: Exportar CSV (Admin)
1. Ir a "Reportes"
2. Click "Exportar CSV"
3. **Resultado esperado**: Se descarga archivo CSV

## Test 6: Permisos y Seguridad

### Caso 6.1: Brigadista intenta acceder a Admin
1. Login como brigadista
2. Intentar acceder a http://localhost:3000/admin
3. **Resultado esperado**: Redirección a /brigadista

### Caso 6.2: Admin intenta acceder a Brigadista
1. Login como admin
2. Intentar acceder a http://localhost:3000/brigadista
3. **Resultado esperado**: Redirección a /admin

### Caso 6.3: Usuario no autenticado
1. Sin login, intentar acceder a /admin o /brigadista
2. **Resultado esperado**: Redirección a /login

## Test 7: APIs Directas

### Caso 7.1: Backend Principal
```bash
# Health check
curl http://localhost:5000/

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"admin@ifn.com","password":"admin123"}'
```

### Caso 7.2: Microservicio Análisis
```bash
curl http://localhost:5001/health
curl http://localhost:5001/api/analisis/especies
```

### Caso 7.3: Microservicio Zonas
```bash
curl http://localhost:5002/health
curl http://localhost:5002/api/zonas
```

## Test 8: Temas

### Caso 8.1: Cambiar Tema
1. En cualquier página
2. Click en botón "Tema"
3. **Resultado esperado**: Cambia de verde a azul

### Caso 8.2: Persistencia del Tema
1. Cambiar tema
2. Recargar página
3. **Resultado esperado**: Tema se mantiene

## Reporte de Resultados

| Test | Caso | Estado | Observaciones |
|------|------|--------|---------------|
| 1.1  | Login Admin | ✅ PASS | |
| 1.2  | Login Brigadista | ✅ PASS | |
| 1.3  | Login Fallido | ✅ PASS | |
| ... | ... | ... | ... |

**Fecha de testing**: __________
**Testeador**: __________
**Versión**: 1.0.0
```

---

## 🎉 RESUMEN FINAL

### Lo que hemos construido:

1. ✅ **Backend Principal** (Node.js + Express + MongoDB)
   - Sistema de autenticación con JWT
   - CRUD completo para todas las entidades
   - Middleware de autorización por roles

2. ✅ **Microservicio de Análisis** (Python + Flask + Oracle)
   - Análisis estadísticos con Pandas
   - Generación de PDFs con ReportLab
   - Integración con MongoDB via API

3. ✅ **Microservicio de Zonas** (Node.js + Express + Oracle)
   - CRUD de zonas geográficas
   - Almacenamiento en Oracle DB

4. ✅ **Frontend Completo** (React)
   - 15+ páginas funcionales
   - Context API para estado global
   - Rutas protegidas por rol
   - Mapas interactivos con Leaflet
   - Exportación de datos (CSV)

### Tecnologías Utilizadas:

| Componente | Tecnología |
|------------|------------|
| Frontend | React 18, React Router, Leaflet, Axios |
| Backend Principal | Node.js, Express, MongoDB, JWT, Bcrypt |
| Microservicio Análisis | Python, Flask, Oracle, Pandas, ReportLab |
| Microservicio Zonas | Node.js, Express, Oracle |
| Bases de Datos | MongoDB Atlas, Oracle XE 21c |

### Estructura Final del Proyecto:
```
ifn-project/
├── backend/                    # Node.js + MongoDB
├── microservicio-analisis/     # Python + Oracle
├── microservicio-oracle/       # Node.js + Oracle
├── frontend/                   # React
├── scripts/                    # Scripts de inicio
├── docs/                       # Documentación
├── README.md
└── .gitignore
# Sistema IFN - Inventario Forestal Nacional

Sistema completo de gestión de inventarios forestales con arquitectura de microservicios.

## 🏗️ Arquitectura del Sistema
```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                         │
│                   Puerto: 3000                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────────┐
        │                                             │
        ▼                                             ▼
┌──────────────────┐                    ┌──────────────────────┐
│  Backend Principal│                    │  Microservicios      │
│  Node.js + MongoDB│                    │                      │
│  Puerto: 5000     │                    │  1. Análisis (5001)  │
│                   │                    │     Python + Oracle  │
│  - Autenticación  │                    │                      │
│  - Conglomerados  │                    │  2. Zonas (5002)     │
│  - Subparcelas    │                    │     Node.js + Oracle │
│  - Árboles        │                    │                      │
│  - Muestras       │                    └──────────────────────┘
│  - Usuarios       │
└──────────────────┘
        │
        ▼
┌──────────────────┐
│   MongoDB Atlas  │
└──────────────────┘
```

## 📋 Requisitos Previos

### Software Necesario:
- **Node.js** v16+ (https://nodejs.org/)
- **Python** 3.9+ (https://www.python.org/)
- **MongoDB Atlas** (cuenta gratuita en https://www.mongodb.com/cloud/atlas)
- **Oracle Database XE 21c** (https://www.oracle.com/database/technologies/xe-downloads.html)

### Opcional:
- **Docker** (para PostgreSQL si no tienes Oracle instalado localmente)
- **Git** (para clonar el repositorio)

## 🚀 Instalación Paso a Paso

### 1. Clonar el Repositorio
```bash
git clone <url-del-repositorio>
cd ifn-project
```

### 2. Configurar MongoDB Atlas

1. Crea una cuenta en MongoDB Atlas
2. Crea un nuevo cluster (gratis)
3. Obtén tu connection string
4. Agrega tu IP a la whitelist

### 3. Configurar Oracle Database

**Opción A: Instalación Local**
```bash
# Después de instalar Oracle XE, conectarse:
sqlplus system/password@localhost:1521/XEPDB1

# Crear usuario:
CREATE USER ifn_oracle IDENTIFIED BY oracle123;
GRANT CONNECT, RESOURCE TO ifn_oracle;
GRANT UNLIMITED TABLESPACE TO ifn_oracle;
```

**Opción B: Docker**
```bash
docker run --name oracle-xe \
  -e ORACLE_PASSWORD=oracle123 \
  -p 1521:1521 \
  -d container-registry.oracle.com/database/express:21.3.0-xe
```

### 4. Instalar Backend Principal
```bash
cd backend
npm install

# Crear archivo .env
cat > .env << EOF
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/ifn_database
PORT=5000
JWT_SECRET=tu_clave_secreta_super_segura_123456
EOF

# Crear usuarios de prueba
node scripts/seedUsers.js
```

### 5. Instalar Microservicio de Análisis (Python + Oracle)
```bash
cd ../microservicio-analisis
python -m venv venv
source venv/bin/activate  # Linux/Mac
# o
venv\Scripts\activate  # Windows

pip install -r requirements.txt

# Crear archivo .env
cat > .env << EOF
FLASK_PORT=5001
ORACLE_USER=ifn_oracle
ORACLE_PASSWORD=oracle123
ORACLE_DSN=localhost:1521/XEPDB1
NODE_BACKEND_URL=http://localhost:5000
EOF
```

### 6. Instalar Microservicio de Zonas (Node.js + Oracle)
```bash
cd ../microservicio-oracle
npm install

# Crear archivo .env
cat > .env << EOF
PORT=5002
ORACLE_USER=ifn_oracle
ORACLE_PASSWORD=oracle123
ORACLE_CONNECTION_STRING=localhost:1521/XEPDB1
EOF
```

### 7. Instalar Frontend (React)
```bash
cd ../frontend
npm install

# Crear archivo .env
cat > .env << EOF
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ANALISIS_URL=http://localhost:5001
REACT_APP_ZONA_URL=http://localhost:5002
EOF
```

## 🎮 Ejecución del Sistema

### Opción 1: Script Automático (Recomendado)

**Linux/Mac:**
```bash
./scripts/start-all.sh
```

**Windows:**
```batch
scripts\start-all.bat
```

### Opción 2: Manual (cada servicio en una terminal diferente)

**Terminal 1 - Backend Principal:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Microservicio de Análisis:**
```bash
cd microservicio-analisis
source venv/bin/activate  # o venv\Scripts\activate en Windows
python app.py
```

**Terminal 3 - Microservicio de Zonas:**
```bash
cd microservicio-oracle
npm start
```

**Terminal 4 - Frontend:**
```bash
cd frontend
npm start
```

## 🌐 URLs de Acceso

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Frontend | http://localhost:3000 | Interfaz de usuario |
| Backend Principal | http://localhost:5000 | API REST principal |
| Microservicio Análisis | http://localhost:5001 | Análisis y reportes PDF |
| Microservicio Zonas | http://localhost:5002 | Gestión de zonas geográficas |

## 👥 Usuarios de Prueba

| Rol | Correo | Contraseña |
|-----|--------|------------|
| Administrador | admin@ifn.com | admin123 |
| Brigadista | demo@ifn.com | demo123 |

## 📖 Guía de Uso

### Para Brigadistas:

1. **Iniciar Sesión**
   - Accede a http://localhost:3000/login
   - Usa las credenciales de brigadista

2. **Registrar Conglomerado**
   - Ve a "Registrar Conglomerado"
   - Completa el formulario con formato CG-####
   - Guarda los datos

3. **Registrar Subparcela**
   - Ve a "Registrar Subparcela"
   - Asocia con un conglomerado existente
   - Formato: SP-####

4. **Registrar Árbol**
   - Ve a "Registrar Árbol"
   - Asocia con una subparcela
   - Registra DAP, altura, especie

5. **Registrar Muestra**
   - Ve a "Registrar Muestra"
   - Asocia con un árbol
   - Adjunta foto (opcional)

6. **Ver Reportes**
   - Ve a "Mis Reportes"
   - Filtra por tipo o estado
   - Exporta a CSV

7. **Ver Zonas**
   - Ve a "Zonas Asignadas"
   - Visualiza en el mapa
   - Exporta listado

### Para Administradores:

1. **Gestionar Brigadistas**
   - Crear, editar, eliminar brigadistas
   - Asignar zonas

2. **Gestionar Zonas**
   - Crear zonas en el mapa
   - Editar ubicaciones
   - Ver zonas en Oracle DB

3. **Revisar Reportes**
   - Ver todas las muestras
   - Cambiar estados (Pendiente → Procesado)
   - Filtrar por brigadista

4. **Ver Estadísticas**
   - Análisis automático de datos
   - Gráficas y tablas
   - Descargar reportes PDF

5. **Configurar Sistema**
   - Cambiar tema
   - Actualizar perfil
   - Gestionar caché

## 🔧 Solución de Problemas

### Error: "Cannot connect to MongoDB"
```bash
# Verifica tu connection string
# Asegúrate de que tu IP esté en la whitelist de MongoDB Atlas
# Verifica usuario y contraseña
```

### Error: "Oracle connection failed"
```bash
# Verifica que Oracle esté corriendo:
lsnrctl status

# Prueba la conexión:
sqlplus ifn_oracle/oracle123@localhost:1521/XEPDB1
```

### Error: "Port already in use"
```bash
# Encuentra el proceso usando el puerto:
# Linux/Mac:
lsof -i :5000
kill -9 <PID>

# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Error: "Module not found"
```bash
# Reinstala dependencias:
# Backend y Microservicio Zonas:
rm -rf node_modules package-lock.json
npm install

# Frontend:
cd frontend
rm -rf node_modules package-lock.json
npm install

# Microservicio Análisis:
cd microservicio-analisis
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## 📊 Estructura de la Base de Datos

### MongoDB (Backend Principal)
- **usuarios**: Datos de usuarios (admin/brigadistas)
- **conglomerados**: Puntos de muestreo principales
- **subparcelas**: Subdivisiones de conglomerados
- **arboles**: Árboles individuales con medidas
- **muestras**: Muestras biológicas con imágenes

### Oracle (Microservicios)
- **analisis_reportes**: Historial de análisis generados
- **zonas**: Zonas geográficas de trabajo

## 🧪 Testing

### Probar APIs con curl

**Backend Principal:**
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"admin@ifn.com","password":"admin123"}'

# Obtener conglomerados (requiere token)
curl http://localhost:5000/api/conglomerados \
  -H "x-auth-token: TU_TOKEN_AQUI"
```

**Microservicio de Análisis:**
```bash
# Health check
curl http://localhost:5001/health

# Análisis de especies
curl http://localhost:5001/api/analisis/especies
```

**Microservicio de Zonas:**
```bash
# Health check
curl http://localhost:5002/health

# Obtener zonas
curl http://localhost:5002/api/zonas
```

## 📦 Exportar Datos

### CSV
- Desde el frontend: Botón "Exportar CSV" en cada tabla
- Incluye filtros aplicados

### PDF
- Desde "Estadísticas" → "Descargar Reporte PDF"
- Generado por el microservicio Python
- Incluye gráficas y tablas

## 🔐 Seguridad

- **JWT**: Tokens con expiración de 24 horas
- **Bcrypt**: Contraseñas hasheadas con salt
- **CORS**: Configurado para localhost
- **Validación**: En frontend y backend
- **Roles**: Admin y Brigadista con permisos diferenciados

## 🎨 Temas

El sistema soporta 2 temas:
- **Verde** (predeterminado)
- **Azul oscuro**

Cambiar desde el botón "Tema" en el header o desde Configuración.

## 📝 Notas Adicionales

- Los códigos deben seguir el formato:
  - Conglomerados: `CG-####`
  - Subparcelas: `SP-####`
  - Árboles: `AR-####`
  - Muestras: `MS-####`

- Las coordenadas deben estar en formato decimal (WGS84)

- Las imágenes se almacenan en Base64 en MongoDB

- Los reportes PDF se generan en tiempo real

## 🤝 Contribuidores

- Didier Orduz
- Cristian Aranguren
- Nemrod Romero

Universidad de Investigacion y Desarrollo - Proyecto Integrador II - 2025-II

## 📄 Licencia

Este proyecto es de uso educativo para la Universidad Investigacion y Desarrollo.

---

**¿Problemas?** Revisa la sección de Solución de Problemas o contacta al equipo.
```

### 5.3 Archivo .gitignore

**.gitignore (en la raíz del proyecto):**
```
# Dependencias
node_modules/
venv/
__pycache__/
*.pyc

# Variables de entorno
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
*.log

# Build
build/
dist/
.next/
out/

# IDEs
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Testing
coverage/

# Temporal
*.tmp
*.temp

# Oracle
*.ora
wallet/

# MongoDB
dump/

# Reportes generados
reportes_generados/
*.pdf
*.csv
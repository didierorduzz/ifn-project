# Flujo del Sistema IFN

## 1. Flujo de Autenticación
```
Usuario → Login Form → Backend /api/auth/login
                           ↓
                      Verifica credenciales
                           ↓
                      Genera JWT Token
                           ↓
                      Retorna token + datos usuario
                           ↓
Frontend guarda en localStorage → Redirige a Dashboard
```

## 2. Flujo de Registro de Muestra
```
Brigadista → Formulario Muestra
                ↓
          Valida formato
                ↓
          POST /api/muestras (Backend Principal)
                ↓
          Guarda en MongoDB
                ↓
          POST /api/notificaciones (Microservicio Análisis)
                ↓
          Registra en Oracle
                ↓
          Retorna éxito → Muestra confirmación
```

## 3. Flujo de Generación de Reportes
```
Admin → Estadísticas
           ↓
     Click "Generar PDF"
           ↓
     GET /api/reportes/pdf/especies (Microservicio Análisis)
           ↓
     Python consulta MongoDB (via Backend)
           ↓
     Procesa datos con Pandas
           ↓
     Genera PDF con ReportLab
           ↓
     Guarda registro en Oracle
           ↓
     Retorna PDF → Usuario descarga
```

## 4. Flujo de Gestión de Zonas
```
Admin → Gestión Zonas
           ↓
     Click en mapa (Leaflet)
           ↓
     Completa formulario
           ↓
     POST /api/zonas (Microservicio Oracle)
           ↓
     Inserta en Oracle DB
           ↓
     Retorna éxito → Muestra en mapa
```

## 5. Integración entre Servicios
```
┌─────────┐
│ Frontend│
└────┬────┘
     │
     ├──────────────────────┬──────────────────────┐
     ▼                      ▼                      ▼
┌──────────┐         ┌──────────┐         ┌──────────┐
│ Backend  │◄───────►│Análisis  │         │  Zonas   │
│ Principal│         │(Python)  │         │ (Oracle) │
└────┬─────┘         └────┬─────┘         └──────────┘
     │                    │
     ▼                    ▼
┌─────────┐         ┌─────────┐
│ MongoDB │         │  Oracle │
└─────────┘         └─────────┘
```
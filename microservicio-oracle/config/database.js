const oracledb = require('oracledb');
require('dotenv').config();

// Configurar Oracle para usar modo thick client (necesario en algunos sistemas)
try {
  oracledb.initOracleClient();
} catch (err) {
  console.log('Oracle Client ya inicializado o no es necesario');
}

const dbConfig = {
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PASSWORD,
  connectString: process.env.ORACLE_CONNECTION_STRING
};

async function initialize() {
  try {
    await oracledb.createPool(dbConfig);
    console.log('✅ Pool de conexiones Oracle creado');
    
    // Crear tabla si no existe
    const connection = await oracledb.getConnection();
    
    const createTableSQL = `
      BEGIN
        EXECUTE IMMEDIATE '
          CREATE TABLE zonas (
            id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            nombre VARCHAR2(255) NOT NULL,
            tipo VARCHAR2(100) NOT NULL,
            latitud NUMBER(10,7) NOT NULL,
            longitud NUMBER(10,7) NOT NULL,
            descripcion CLOB,
            estado VARCHAR2(50) DEFAULT ''Activa'',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        ';
      EXCEPTION
        WHEN OTHERS THEN
          IF SQLCODE != -955 THEN -- -955 = tabla ya existe
            RAISE;
          END IF;
      END;
    `;
    
    await connection.execute(createTableSQL);
    await connection.commit();
    await connection.close();
    
    console.log('✅ Tabla zonas verificada/creada');
  } catch (err) {
    console.error('❌ Error al inicializar Oracle:', err);
    process.exit(1);
  }
}

async function close() {
  await oracledb.getPool().close(0);
}

module.exports = {
  initialize,
  close,
  oracledb
};
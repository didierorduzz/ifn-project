const oracledb = require('oracledb');

class Zona {
  static async crear(data) {
    let connection;
    try {
      connection = await oracledb.getConnection();
      
      const sql = `
        INSERT INTO zonas (nombre, tipo, latitud, longitud, descripcion, estado)
        VALUES (:nombre, :tipo, :latitud, :longitud, :descripcion, :estado)
        RETURNING id INTO :id
      `;
      
      const result = await connection.execute(
        sql,
        {
          nombre: data.nombre,
          tipo: data.tipo,
          latitud: data.latitud,
          longitud: data.longitud,
          descripcion: data.descripcion || null,
          estado: data.estado || 'Activa',
          id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        },
        { autoCommit: true }
      );
      
      return { id: result.outBinds.id[0], ...data };
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }
  
  static async obtenerTodas() {
    let connection;
    try {
      connection = await oracledb.getConnection();
      
      const result = await connection.execute(
        `SELECT id, nombre, tipo, latitud, longitud, descripcion, estado,
                TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at
         FROM zonas
         ORDER BY created_at DESC`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
      return result.rows;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }
  
  static async obtenerPorId(id) {
    let connection;
    try {
      connection = await oracledb.getConnection();
      
      const result = await connection.execute(
        `SELECT id, nombre, tipo, latitud, longitud, descripcion, estado,
                TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at
         FROM zonas
         WHERE id = :id`,
        [id],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
      return result.rows[0] || null;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }
  
  static async actualizar(id, data) {
    let connection;
    try {
      connection = await oracledb.getConnection();
      
      const sql = `
        UPDATE zonas
        SET nombre = :nombre,
            tipo = :tipo,
            latitud = :latitud,
            longitud = :longitud,
            descripcion = :descripcion,
            estado = :estado,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = :id
      `;
      
      await connection.execute(
        sql,
        {
          nombre: data.nombre,
          tipo: data.tipo,
          latitud: data.latitud,
          longitud: data.longitud,
          descripcion: data.descripcion,
          estado: data.estado,
          id: id
        },
        { autoCommit: true }
      );
      
      return await this.obtenerPorId(id);
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }
  
  static async eliminar(id) {
    let connection;
    try {
      connection = await oracledb.getConnection();
      
      await connection.execute(
        'DELETE FROM zonas WHERE id = :id',
        [id],
        { autoCommit: true }
      );
      
      return true;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }
}

module.exports = Zona;
Procedimiento: Crear conglomerado con subparcelas automáticas

CREATE OR REPLACE PROCEDURE sp_crear_conglomerado(
    p_codigo IN VARCHAR2,
    p_nombre IN VARCHAR2,
    p_latitud IN NUMBER,
    p_longitud IN NUMBER,
    p_zona_utm IN VARCHAR2,
    p_datum IN VARCHAR2,
    p_precision_gps IN NUMBER,
    p_usuario_id IN NUMBER,
    p_delta_x IN NUMBER DEFAULT 50,
    p_delta_y IN NUMBER DEFAULT 50,
    p_conglomerado_id OUT NUMBER
)
IS
    v_subparcela_id NUMBER;
    TYPE t_cuadrante IS RECORD (
        nombre VARCHAR2(2),
        offset_x NUMBER,
        offset_y NUMBER
    );
    TYPE t_cuadrantes IS TABLE OF t_cuadrante INDEX BY PLS_INTEGER;
    v_cuadrantes t_cuadrantes;
BEGIN
    -- Validar coordenadas
    IF NOT validar_coordenadas(p_latitud, p_longitud) THEN
        RAISE_APPLICATION_ERROR(-20002, 'Coordenadas fuera del rango válido para Colombia');
    END IF;
    
    -- Insertar conglomerado
    INSERT INTO IFN_CONGLOMERADOS (
        CODIGO, NOMBRE, LATITUD, LONGITUD, 
        ZONA_UTM, DATUM, PRECISION_GPS, USUARIO_ID
    )
    VALUES (
        p_codigo, p_nombre, p_latitud, p_longitud,
        p_zona_utm, p_datum, p_precision_gps, p_usuario_id
    )
    RETURNING ID INTO p_conglomerado_id;
    
    -- Definir cuadrantes con offsets
    v_cuadrantes(1).nombre := 'NE';
    v_cuadrantes(1).offset_x := p_delta_x;
    v_cuadrantes(1).offset_y := p_delta_y;
    
    v_cuadrantes(2).nombre := 'NO';
    v_cuadrantes(2).offset_x := -p_delta_x;
    v_cuadrantes(2).offset_y := p_delta_y;
    
    v_cuadrantes(3).nombre := 'SE';
    v_cuadrantes(3).offset_x := p_delta_x;
    v_cuadrantes(3).offset_y := -p_delta_y;
    
    v_cuadrantes(4).nombre := 'SO';
    v_cuadrantes(4).offset_x := -p_delta_x;
    v_cuadrantes(4).offset_y := -p_delta_y;
    
    -- Crear las 4 subparcelas automáticamente
    FOR i IN 1..4 LOOP
        INSERT INTO IFN_SUBPARCELAS (
            CODIGO, CONGLOMERADO_ID, OFFSET_X, OFFSET_Y
        )
        VALUES (
            v_cuadrantes(i).nombre,
            p_conglomerado_id,
            v_cuadrantes(i).offset_x,
            v_cuadrantes(i).offset_y
        );
    END LOOP;
    
    COMMIT;
    
    DBMS_OUTPUT.PUT_LINE('Conglomerado ' || p_codigo || ' creado con ID: ' || p_conglomerado_id);
    DBMS_OUTPUT.PUT_LINE('Se crearon 4 subparcelas automáticamente');
    
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        ROLLBACK;
        RAISE_APPLICATION_ERROR(-20003, 'El código de conglomerado ya existe');
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE_APPLICATION_ERROR(-20004, 'Error creando conglomerado: ' || SQLERRM);
END;
/

Procedimiento: Generar reporte de árboles por conglomerado

CREATE OR REPLACE PROCEDURE sp_generar_reporte_arboles(
    p_conglomerado_id IN NUMBER,
    p_cursor OUT SYS_REFCURSOR
)
IS
BEGIN
    OPEN p_cursor FOR
    SELECT 
        c.CODIGO AS conglomerado,
        c.NOMBRE AS nombre_conglomerado,
        s.CODIGO AS subparcela,
        a.CODIGO AS codigo_arbol,
        a.DAP_CM,
        a.ALTURA_M,
        a.AZIMUT_DEG,
        a.DISTANCIA_M,
        a.OBS AS observaciones,
        a.CREADO_EN
    FROM IFN_CONGLOMERADOS c
    JOIN IFN_SUBPARCELAS s ON c.ID = s.CONGLOMERADO_ID
    JOIN IFN_ARBOLES a ON s.ID = a.SUBPARCELA_ID
    WHERE c.ID = p_conglomerado_id
    ORDER BY s.CODIGO, a.CODIGO;
END;
/

Procedimiento: Actualizar estadísticas del conglomerado

CREATE OR REPLACE PROCEDURE sp_actualizar_estadisticas_conglomerado(
    p_conglomerado_id IN NUMBER
)
IS
    v_total_arboles NUMBER;
    v_promedio_dap NUMBER;
    v_promedio_altura NUMBER;
    v_densidad NUMBER;
BEGIN
    -- Calcular total de árboles
    SELECT COUNT(*)
    INTO v_total_arboles
    FROM IFN_ARBOLES a
    JOIN IFN_SUBPARCELAS s ON a.SUBPARCELA_ID = s.ID
    WHERE s.CONGLOMERADO_ID = p_conglomerado_id;
    
    -- Calcular promedios
    SELECT 
        NVL(AVG(a.DAP_CM), 0),
        NVL(AVG(a.ALTURA_M), 0)
    INTO v_promedio_dap, v_promedio_altura
    FROM IFN_ARBOLES a
    JOIN IFN_SUBPARCELAS s ON a.SUBPARCELA_ID = s.ID
    WHERE s.CONGLOMERADO_ID = p_conglomerado_id;
    
    -- Calcular densidad
    v_densidad := calcular_densidad_cobertura(p_conglomerado_id);
    
    -- Aquí podrías actualizar una tabla de estadísticas si existe
    DBMS_OUTPUT.PUT_LINE('Estadísticas del Conglomerado ID ' || p_conglomerado_id);
    DBMS_OUTPUT.PUT_LINE('Total árboles: ' || v_total_arboles);
    DBMS_OUTPUT.PUT_LINE('Promedio DAP: ' || ROUND(v_promedio_dap, 2) || ' cm');
    DBMS_OUTPUT.PUT_LINE('Promedio Altura: ' || ROUND(v_promedio_altura, 2) || ' m');
    DBMS_OUTPUT.PUT_LINE('Densidad: ' || ROUND(v_densidad, 4) || ' árboles/m²');
END;
/
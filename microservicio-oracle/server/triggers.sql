Trigger: Validar DAP antes de insertar árbol

CREATE OR REPLACE TRIGGER trg_validar_dap_arbol
BEFORE INSERT OR UPDATE ON IFN_ARBOLES
FOR EACH ROW
BEGIN
    -- Validar que el DAP sea positivo
    IF :NEW.DAP_CM <= 0 THEN
        RAISE_APPLICATION_ERROR(-20005, 'El DAP debe ser mayor que 0');
    END IF;
    
    -- Validar rango lógico (árboles muy grandes son raros)
    IF :NEW.DAP_CM > 500 THEN
        RAISE_APPLICATION_ERROR(-20006, 'El DAP parece muy grande (>500cm). Verificar medición.');
    END IF;
    
    -- Validar altura
    IF :NEW.ALTURA_M <= 0 THEN
        RAISE_APPLICATION_ERROR(-20007, 'La altura debe ser mayor que 0');
    END IF;
    
    IF :NEW.ALTURA_M > 100 THEN
        RAISE_APPLICATION_ERROR(-20008, 'La altura parece muy grande (>100m). Verificar medición.');
    END IF;
    
    -- Validar azimut
    IF :NEW.AZIMUT_DEG IS NOT NULL AND (:NEW.AZIMUT_DEG < 0 OR :NEW.AZIMUT_DEG >= 360) THEN
        RAISE_APPLICATION_ERROR(-20009, 'El azimut debe estar entre 0 y 360 grados');
    END IF;
END;
/

Trigger: Registrar auditoría al crear muestra

CREATE OR REPLACE TRIGGER trg_auditoria_muestra
AFTER INSERT OR UPDATE OR DELETE ON IFN_MUESTRAS
FOR EACH ROW
DECLARE
    v_operacion VARCHAR2(10);
    v_usuario VARCHAR2(100);
BEGIN
    -- Determinar tipo de operación
    IF INSERTING THEN
        v_operacion := 'INSERT';
    ELSIF UPDATING THEN
        v_operacion := 'UPDATE';
    ELSIF DELETING THEN
        v_operacion := 'DELETE';
    END IF;
    
    -- Obtener usuario actual
    v_usuario := USER;
    
    -- Insertar en tabla de auditoría (si existe)
    -- INSERT INTO IFN_AUDITORIA (...)
    -- VALUES (...);
    
    -- Por ahora solo log
    DBMS_OUTPUT.PUT_LINE('Auditoría: ' || v_operacion || ' en IFN_MUESTRAS por ' || v_usuario);
END;
/

Trigger: Validar código único de muestra

CREATE OR REPLACE TRIGGER trg_validar_codigo_muestra
BEFORE INSERT OR UPDATE ON IFN_MUESTRAS
FOR EACH ROW
DECLARE
    v_existe NUMBER;
BEGIN
    -- Validar que el código único no esté duplicado
    IF :NEW.CODIGO_UNICO IS NOT NULL THEN
        SELECT COUNT(*)
        INTO v_existe
        FROM IFN_MUESTRAS
        WHERE CODIGO_UNICO = :NEW.CODIGO_UNICO
        AND ID != NVL(:NEW.ID, -1);
        
        IF v_existe > 0 THEN
            RAISE_APPLICATION_ERROR(-20010, 'El código de muestra ya existe en el sistema');
        END IF;
    END IF;
    
    -- Validar que tenga imagen
    IF :NEW.IMAGEN_URI IS NULL THEN
        RAISE_APPLICATION_ERROR(-20011, 'Toda muestra debe tener una imagen asociada');
    END IF;
END;
/

Trigger: Autocompletar fecha de creación

CREATE OR REPLACE TRIGGER trg_fecha_creacion
BEFORE INSERT ON IFN_ARBOLES
FOR EACH ROW
BEGIN
    IF :NEW.CREADO_EN IS NULL THEN
        :NEW.CREADO_EN := SYSTIMESTAMP;
    END IF;
END;
/
// ============================================================================
// CONFIGURACION DE MODULOS Y DEPENDENCIAS (Por: Juan Jose Corrales)
// ============================================================================
// Carga las variables de entorno definidas en el archivo .env (host, usuario,
// contrasena y nombre de la base de datos), para no dejar credenciales
// escritas directamente en el codigo.
require('dotenv').config();

// Driver de MySQL con soporte de Promesas, permite usar async/await en lugar
// de callbacks para todas las consultas a la base de datos.
const mysql = require('mysql2/promise');

// Modulo nativo de Node para leer entradas del usuario desde la consola
// (terminal), tambien con soporte de Promesas.
const readline = require('readline/promises');

// Modulo nativo de Node para funciones criptograficas, usado aqui para
// generar el hash SHA-256 de las contrasenas.
const crypto = require('crypto');

// Interfaz de lectura/escritura en consola: input toma el teclado y output
// imprime en la terminal.
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Variable global que guarda la conexion activa a MySQL para reutilizarla
// en todas las funciones del programa.
let connection;

// Variable global que guarda los datos del usuario que inicio sesion
// (objeto "persona"); se usa para saber el rol y filtrar la informacion
// que le corresponde ver.
let usuarioActivo = null;

// ============================================================================
// ENCRIPTACION Y LOGIN (Por: Juan Carlos Perez)
// ============================================================================

// Funcion para generar Hash de contrasena (SHA-256)
function generarHash(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// ============================================================================
// VALIDACIONES DE ENTRADA (Por: Mareli Villada Cartas)
// ============================================================================

// Validacion de ID / INE (maximo 10 caracteres)
function validarId(id) {
    if (!id || id.trim().length === 0) {
        return { valido: false, mensaje: "El ID no puede estar vacio." };
    }
    if (id.length > 10) {
        return { valido: false, mensaje: "El ID debe tener un maximo de 10 caracteres." };
    }
    return { valido: true };
}

// ============================================================================
// CONEXION E INICIALIZACION DE BASE DE DATOS (Por: Juan Jose Corrales)
// ============================================================================

// Establece la conexion con MySQL usando las variables de entorno (o valores
// por defecto si no existen) y prepara el sistema para empezar a funcionar.
async function inicializarBD() {
    try {
        // Se crea la conexion a la base de datos con los datos de .env;
        // si alguna variable no esta definida, se usa un valor por defecto
        // (utiles para pruebas locales con XAMPP/WAMP).
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'sistema_consultorio',
            port: parseInt(process.env.DB_PORT || '3306')
        });
        
        console.log("[SISTEMA] Conectado exitosamente a la base de datos MySQL.");

        // Crear administrador por defecto si no existe ninguno
        // Se busca si ya existe algun usuario con rol "Administrador" o "admin".
        // Esto evita quedarse sin acceso al sistema en una instalacion nueva.
        const [rows] = await connection.query("SELECT * FROM persona WHERE rol = 'Administrador' OR rol = 'admin'");
        if (rows.length === 0) {
            // Si no hay ningun administrador, se crea uno con credenciales
            // predefinidas (ADM001 / admin123) para poder entrar la primera vez.
            await connection.query(
                "INSERT INTO persona (ine, nombre, fecha_nacimiento, correo, contrasenia, rol) VALUES (?, ?, ?, ?, ?, ?)",
                ["ADM001", "Administrador del Sistema", "1990-01-01", "admin@hospital.com", "admin123", "Administrador"]
            );
            console.log("[SISTEMA] Administrador por defecto creado (Usuario: ADM001 o admin@hospital.com, Clave: admin123).");
        }
    } catch (error) {
        // Si falla la conexion (por ejemplo, el servidor MySQL no esta
        // encendido o la BD no existe), se informa el error y se cierra
        // el programa, ya que sin BD el sistema no puede funcionar.
        console.error("[ERROR] No se pudo conectar a la base de datos MySQL:", error.message);
        console.log("Por favor, asegurese de tener el servidor local activo (XAMPP/WAMP) y haber creado la base de datos.");
        process.exit(1);
    }
}

// ============================================================================
// AUTENTICACION Y CONTROL DE ACCESO (Por: Juan Carlos Perez)
// ============================================================================
async function iniciarSesion() {
// Funcion para el inicio de sesion. Asincrona para la lectura de la DB
//  en simultaneo sin detener la ejecucion de index.js
    console.log("\n=========================================");
    console.log("           INICIO DE SESION");
    console.log("=========================================");

    // constantes para la solicitud de datos. Espera a que el usuario introduzca los datos
    // Los espacios sobrantes son eliminados para evitar errores de dedo
    const identifier = (await rl.question("Usuario (INE o Correo): ")).trim();
    const password = (await rl.question("Contrasena: ")).trim();

    // Verificar que los 2 campos no esten vacios
    if (!identifier || !password) {
        console.log("\n[ERROR] El usuario y la contrasena son obligatorios.");
        return false;
    }

    // Consulta a la DB para buscar el usuario con las credenciales que coinciden con las ingresadas
    // los signos '?' son marcadores de posicion que se remplazan de forma segura por los valores del arreglo,
    // esto para evitar ataques de inyeccion SQL en el inicio de sesion.
    try {
        const [rows] = await connection.query(
            "SELECT * FROM persona WHERE ine = ? OR correo = ?",
            [identifier, identifier]
        );

        // Si el arreglo de resultados esta vacio, ningun usuario coincide con los datos ingresados
        if (rows.length === 0) {
            console.log("\n[ERROR] Usuario no encontrado.");
            return false;
        }

        // Obtener el registro encontrado
        const user = rows[0];
        // Cifrar la contrase;a
        const hashedInput = generarHash(password);

        // Comprobacion de credenciales. 
        // 1. Se valida en texto plano en caso de que sea un registro antiguo (previo a la implementacion del cifrado hash)
        // 2. Se valida la contraseña cifrada
        if (user.contrasenia === password || user.contrasenia === hashedInput) {
            // Guardar informacion del usuario durante la sesion
            usuarioActivo = user;
            console.log(`\n[ACCESO] Bienvenido al sistema, ${user.nombre} (${user.rol})!`); // Mostrar datos y rol del usuario
            // inicio de sesion correcto
            return true; 
        } else {
            console.log("\n[ERROR] Contrasena incorrecta.");
            // inicio de sesion incorecto (ninguna de las validaciones es exitosa)
            return false;
        }
    } catch (error) {
        // captura errores en la consulta con MySQL o errores de sintaxis y se muestra en consola
        console.error("\n[ERROR] Fallo al validar credenciales:", error.message);
        return false;
    }
}

// ============================================================================
// INTERFAZ DE MENUS Y SUBMENUS POR ROL (Por: Mareli Villada Cartas)
// ============================================================================

// MENU ADMINISTRADOR
async function menuAdmin() {
    let salir = false;
    while (!salir) {
        console.log("\n=== MENU ADMINISTRADOR ===");
        console.log("1. Registrar Recepcionista");
        console.log("2. Registrar Medico");
        console.log("3. Registrar Paciente");
        console.log("4. Ver todos los usuarios");
        console.log("0. Cerrar sesion");
        
        const opcion = (await rl.question("Seleccione una opcion: ")).trim();

        switch (opcion) {
            case '1':
                await registrarRecepcionista();
                break;
            case '2':
                await registrarMedico();
                break;
            case '3':
                await registrarPaciente();
                break;
            case '4':
                await verUsuarios();
                break;
            case '0':
                console.log("\nCerrando sesion de administrador...");
                usuarioActivo = null;
                salir = true;
                break;
            default:
                console.log("\n[ERROR] Opcion no valida.");
        }
    }
}

// MENU RECEPCIONISTA
async function menuRecepcionista() {
    let salir = false;
    while (!salir) {
        console.log("\n=== MENU RECEPCIONISTA ===");
        console.log("1. Registrar nuevo paciente");
        console.log("2. Ver pacientes registrados");
        console.log("3. Programar cita medica");
        console.log("0. Cerrar sesion");
        
        const opcion = (await rl.question("Seleccione una opcion: ")).trim();

        switch (opcion) {
            case '1':
                await registrarPaciente();
                break;
            case '2':
                await verPacientes();
                break;
            case '3':
                await programarCita();
                break;
            case '0':
                console.log("\nCerrando sesion de recepcionista...");
                usuarioActivo = null;
                salir = true;
                break;
            default:
                console.log("\n[ERROR] Opcion no valida.");
        }
    }
}

// MENU MEDICO
async function menuMedico() {
    let salir = false;
    while (!salir) {
        console.log("\n=== MENU MEDICO ===");
        console.log("1. Consultar mi agenda de citas");
        console.log("2. Ver lista general de pacientes");
        console.log("0. Cerrar sesion");
        
        const opcion = (await rl.question("Seleccione una opcion: ")).trim();

        switch (opcion) {
            case '1':
                await verAgendaMedico();
                break;
            case '2':
                await verPacientes();
                break;
            case '0':
                console.log("\nCerrando sesion de medico...");
                usuarioActivo = null;
                salir = true;
                break;
            default:
                console.log("\n[ERROR] Opcion no valida.");
        }
    }
}

// MENU PACIENTE
async function menuPaciente() {
    let salir = false;
    while (!salir) {
        console.log("\n=== MENU PACIENTE ===");
        console.log("1. Ver mis datos personales");
        console.log("2. Ver mis citas medicas");
        console.log("0. Cerrar sesion");
        
        const opcion = (await rl.question("Seleccione una opcion: ")).trim();

        switch (opcion) {
            case '1':
                await verDatosPaciente();
                break;
            case '2':
                await verCitasPaciente();
                break;
            case '0':
                console.log("\nCerrando sesion de paciente...");
                usuarioActivo = null;
                salir = true;
                break;
            default:
                console.log("\n[ERROR] Opcion no valida.");
        }
    }
}

// ============================================================================
// TRANSACCIONES Y OPERACIONES EN BASE DE DATOS (Por: Juan Jose Corrales)
// ============================================================================

// Pide los datos comunes a cualquier persona (INE, nombre, fecha de
// nacimiento, correo y contrasena) y devuelve un objeto listo para
// insertarse en la tabla "persona". El parametro "rol" indica el tipo
// de usuario que se esta registrando (Medico, Paciente, etc.).
async function capturarDatosPersona(rol) {
    console.log(`\n--- Registro de ${rol} ---`);
    let ine = "";

    // Ciclo que se repite hasta que el INE ingresado sea valido y no
    // este duplicado en la base de datos.
    while (true) {
        ine = (await rl.question("INE / ID (max 10 caracteres): ")).trim();
        const valid = validarId(ine);
        if (!valid.valido) {
            console.log(`[ERROR] ${valid.mensaje}`);
            continue;
        }
        // Verificar duplicados en la base de datos
        const [rows] = await connection.query("SELECT ine FROM persona WHERE ine = ?", [ine]);
        if (rows.length > 0) {
            console.log("[ERROR] Ya existe un usuario registrado con ese INE.");
            continue;
        }
        break;
    }

    const nombre = (await rl.question("Nombre completo: ")).trim();
    const fecha_nacimiento = (await rl.question("Fecha de nacimiento (AAAA-MM-DD): ")).trim();
    const correo = (await rl.question("Correo electronico: ")).trim();
    const contraseniaPlana = (await rl.question("Contrasena: ")).trim();
    // La contrasena se guarda ya "hasheada", nunca en texto plano.
    const contraseniaHash = generarHash(contraseniaPlana);

    return { ine, nombre, fecha_nacimiento, correo, contrasenia: contraseniaHash, rol };
}
// Registra una nueva Recepcionista: primero captura los datos generales de
// persona y luego los datos especificos de recepcionista (turno y
// escritorio), guardando todo en una sola transaccion.
async function registrarRecepcionista() {
    // Se obtiene una conexion individual del pool para poder manejar la
    // transaccion de forma aislada (begin/commit/rollback).
    const conn = await connection.getConnection();
    try {
        const datos = await capturarDatosPersona("Recepcionista");
        const turno = (await rl.question("Turno (Matutino/Vespertino/Nocturno): ")).trim();
        const escritorio = (await rl.question("Escritorio/Modulo asignado: ")).trim();

        // Se inicia la transaccion: si algo falla mas adelante, ninguno
        // de los dos INSERT quedara guardado (evita registros a medias).
        await conn.beginTransaction();

        // Primero se inserta en la tabla general "persona"...
        await conn.query(
            "INSERT INTO persona (ine, nombre, fecha_nacimiento, correo, contrasenia, rol) VALUES (?, ?, ?, ?, ?, ?)",
            [datos.ine, datos.nombre, datos.fecha_nacimiento, datos.correo, datos.contrasenia, datos.rol]
        );

        // ...y luego en la tabla especifica "recepcionista", enlazada por INE.
        await conn.query(
            "INSERT INTO recepcionista (ine, turno, escritorio_asignado) VALUES (?, ?, ?)",
            [datos.ine, turno, escritorio]
        );

        // Si ambos INSERT salieron bien, se confirman los cambios de forma
        // permanente en la base de datos.
        await conn.commit();
        console.log("\n[EXITO] Recepcionista registrado y persistido en MySQL.");
    } catch (error) {
        // Si algo fallo, se revierte todo lo que se haya intentado
        // insertar dentro de esta transaccion.
        await conn.rollback();
        console.error("\n[ERROR] No se pudo registrar a la recepcionista:", error.message);
    } finally {
        // La conexion se libera siempre, haya habido error o no, para
        // que vuelva a estar disponible en el pool.
        conn.release();
    }
}

// Registra un nuevo Medico: misma logica que la recepcionista, pero
// guardando especialidad y numero de colegiado en la tabla "medico".
async function registrarMedico() {
    const conn = await connection.getConnection();
    try {
        const datos = await capturarDatosPersona("Medico");
        const especialidad = (await rl.question("Especialidad: ")).trim();
        const num_colegiado = (await rl.question("Numero de colegiado: ")).trim();

        await conn.beginTransaction();

        await conn.query(
            "INSERT INTO persona (ine, nombre, fecha_nacimiento, correo, contrasenia, rol) VALUES (?, ?, ?, ?, ?, ?)",
            [datos.ine, datos.nombre, datos.fecha_nacimiento, datos.correo, datos.contrasenia, datos.rol]
        );

        await conn.query(
            "INSERT INTO medico (ine, especialidad, num_colegiado) VALUES (?, ?, ?)",
            [datos.ine, especialidad, num_colegiado]
        );

        await conn.commit();
        console.log("\n[EXITO] Medico registrado y persistido en MySQL.");
    } catch (error) {
        await conn.rollback();
        console.error("\n[ERROR] No se pudo registrar al medico:", error.message);
    } finally {
        conn.release();
    }
}

// Registra un nuevo Paciente: ademas de los datos generales, le pide
// elegir un medico de cabecera de la lista de medicos existentes y le
// crea automaticamente un historial clinico inicial vacio.
async function registrarPaciente() {
    const conn = await connection.getConnection();
    try {
        const datos = await capturarDatosPersona("Paciente");

        // Mostrar medicos disponibles
        // Se obtiene la lista de medicos (uniendo "medico" con "persona"
        // para tener tambien su nombre) para que el usuario elija uno
        // como medico de cabecera del paciente.
        const [medicos] = await conn.query(
            "SELECT m.ine, p.nombre, m.especialidad FROM medico m JOIN persona p ON m.ine = p.ine"
        );
        // Si no hay ningun medico registrado, no se puede continuar,
        // ya que todo paciente necesita un medico de cabecera.
        if (medicos.length === 0) {
            console.log("\n[ERROR] No hay medicos registrados en el sistema para asociar al paciente.");
            return;
        }

        console.log("\nMedicos disponibles:");
        medicos.forEach((m, i) => {
            console.log(`${i + 1}. ${m.nombre} (${m.especialidad}) [INE: ${m.ine}]`);
        });

        // Se valida que el numero elegido corresponda a una opcion real
        // de la lista mostrada (evita indices fuera de rango).
        let index;
        while (true) {
            const op = await rl.question("Seleccione el numero del medico de cabecera: ");
            index = parseInt(op) - 1;
            if (index >= 0 && index < medicos.length) {
                break;
            }
            console.log("[ERROR] Seleccion invalida.");
        }

        const ine_medico_cabecera = medicos[index].ine;

        await conn.beginTransaction();

        // 1) Se inserta el paciente en la tabla general "persona".
        await conn.query(
            "INSERT INTO persona (ine, nombre, fecha_nacimiento, correo, contrasenia, rol) VALUES (?, ?, ?, ?, ?, ?)",
            [datos.ine, datos.nombre, datos.fecha_nacimiento, datos.correo, datos.contrasenia, datos.rol]
        );
        // 2) Se inserta en la tabla "paciente", enlazandolo con su
        // medico de cabecera elegido.
        await conn.query(
            "INSERT INTO paciente (ine, ine_medico_cabecera) VALUES (?, ?)",
            [datos.ine, ine_medico_cabecera]
        );

        // Crear historial clinico vacio inicial
        // 3) Se crea automaticamente un registro inicial en el historial
        // clinico del paciente, con la fecha de hoy.
        const hoy = new Date().toISOString().slice(0, 10);
        await conn.query(
            "INSERT INTO historialclinico (ine_paciente, fecha_apertura, observaciones_generales) VALUES (?, ?, ?)",
            [datos.ine, hoy, "Historial abierto el dia del registro."]
        );
        // Las tres inserciones (persona, paciente, historial) se
        // confirman juntas; si alguna falla, ninguna se guarda.
        await conn.commit();
        console.log("\n[EXITO] Paciente e Historial Clinico inicial registrados y persistidos en MySQL.");
    } catch (error) {
        await conn.rollback();
        console.error("\n[ERROR] No se pudo registrar al paciente:", error.message);
    } finally {
        conn.release();
    }
}

// Muestra en consola la lista completa de usuarios del sistema
// (cualquier rol), ordenados por rol y luego por nombre. Solo deberia
// ser accesible para el Administrador.
async function verUsuarios() {
    try {
        const [rows] = await connection.query(
            "SELECT ine, nombre, correo, rol FROM persona ORDER BY rol, nombre"
        );
        console.log("\n---------------- USUARIOS DEL SISTEMA ----------------");
        rows.forEach(u => {
            console.log(`INE: ${u.ine} | Nombre: ${u.nombre} | Correo: ${u.correo} | Rol: ${u.rol}`);
        });
        console.log("------------------------------------------------------");
    } catch (error) {
        console.error("\n[ERROR] No se pudo consultar la lista de usuarios:", error.message);
    }
}

// Muestra la lista de pacientes junto con su medico de cabecera y la
// especialidad de ese medico (combina tablas paciente, persona y medico).
async function verPacientes() {
    try {
        const [rows] = await connection.query(
            `SELECT p.ine AS paciente_ine, per1.nombre AS paciente_nombre, per1.correo, 
                    per2.nombre AS medico_nombre, m.especialidad 
             FROM paciente p 
             JOIN persona per1 ON p.ine = per1.ine
             JOIN medico m ON p.ine_medico_cabecera = m.ine
             JOIN persona per2 ON m.ine = per2.ine
             ORDER BY per1.nombre`
        );
        
        console.log("\n---------------- PACIENTES REGISTRADOS ----------------");
        if (rows.length === 0) {
            console.log("No hay pacientes registrados en el sistema.");
        } else {
            rows.forEach(r => {
                console.log(`INE: ${r.paciente_ine} | Paciente: ${r.paciente_nombre} | Medico: ${r.medico_nombre} (${r.especialidad})`);
            });
        }
        console.log("------------------------------------------------------");
    } catch (error) {
        console.error("\n[ERROR] No se pudo consultar la lista de pacientes:", error.message);
    }
}

// Permite agendar una cita medica entre un paciente y un medico existentes,
// validando que ambos existan y que no haya otra cita del mismo medico
// programada exactamente a esa misma fecha y hora.
async function programarCita() {
    try {
        console.log("\n--- Programar Cita Medica ---");
        const ine_paciente = (await rl.question("INE del Paciente: ")).trim();
        
        // Verificar existencia de paciente
        const [pacientes] = await connection.query("SELECT ine FROM paciente WHERE ine = ?", [ine_paciente]);
        if (pacientes.length === 0) {
            console.log("[ERROR] El paciente no existe.");
            return;
        }

        const ine_medico = (await rl.question("INE del Medico: ")).trim();
        // Verificar existencia de medico
        const [medicos] = await connection.query("SELECT ine FROM medico WHERE ine = ?", [ine_medico]);
        if (medicos.length === 0) {
            console.log("[ERROR] El medico no existe.");
            return;
        }

        const fecha = (await rl.question("Fecha (AAAA-MM-DD): ")).trim();
        // Se le agrega ":00" a la hora ingresada (HH:MM) para que quede
        // en formato HH:MM:SS, compatible con el tipo TIME de MySQL.
        const hora = (await rl.question("Hora (HH:MM): ")).trim() + ":00";
        const detalles = (await rl.question("Detalles / Motivo de consulta: ")).trim();

        // Validar que no existan duplicados / empalmes de horario
        // Se revisa si el mismo medico ya tiene una cita exactamente en
        // esa fecha y hora, para evitar que se le encimen dos pacientes.
        const [conflicto] = await connection.query(
            "SELECT id_cita FROM cita WHERE ine_medico = ? AND fecha = ? AND hora = ?",
            [ine_medico, fecha, hora]
        );

        if (conflicto.length > 0) {
            console.log("\n[ERROR CLINICA] Conflicto de horario. El medico ya tiene una cita programada a esa hora.");
            return;
        }
        // Si no hay conflicto, se guarda la nueva cita.
        await connection.query(
            "INSERT INTO cita (fecha, hora, detalles_consulta, ine_paciente, ine_medico) VALUES (?, ?, ?, ?, ?)",
            [fecha, hora, detalles, ine_paciente, ine_medico]
        );

        console.log("\n[EXITO] Cita programada y guardada exitosamente.");
    } catch (error) {
        console.error("\n[ERROR] No se pudo programar la cita:", error.message);
    }
}

// Muestra las citas agendadas del medico que tiene la sesion iniciada
// (usuarioActivo), ordenadas por fecha y hora, junto con el nombre del
// paciente correspondiente a cada cita.
async function verAgendaMedico() {
    try {
        const [citas] = await connection.query(
            `SELECT c.fecha, c.hora, c.detalles_consulta, p.nombre AS paciente_nombre 
             FROM cita c 
             JOIN persona p ON c.ine_paciente = p.ine 
             WHERE c.ine_medico = ? 
             ORDER BY c.fecha, c.hora`,
            [usuarioActivo.ine]
        );

        console.log(`\n--- AGENDA DE CITAS PARA: ${usuarioActivo.nombre} ---`);
        if (citas.length === 0) {
            console.log("No tienes citas programadas.");
        } else {
            citas.forEach(c => {
                console.log(`Fecha: ${c.fecha.toISOString().slice(0,10)} | Hora: ${c.hora} | Paciente: ${c.paciente_nombre} | Motivo: ${c.detalles_consulta}`);
            });
        }
        console.log("-----------------------------------------------------");
    } catch (error) {
        console.error("\n[ERROR] No se pudo consultar la agenda:", error.message);
    }
}

// Muestra los datos personales del paciente que tiene la sesion iniciada,
// incluyendo el nombre y especialidad de su medico de cabecera.
async function verDatosPaciente() {
    try {
        const [pac] = await connection.query(
            `SELECT per1.ine, per1.nombre, per1.correo, per1.fecha_nacimiento, 
                    per2.nombre AS medico_nombre, m.especialidad 
             FROM paciente p 
             JOIN persona per1 ON p.ine = per1.ine
             JOIN medico m ON p.ine_medico_cabecera = m.ine
             JOIN persona per2 ON m.ine = per2.ine
             WHERE p.ine = ?`,
            [usuarioActivo.ine]
        );

        if (pac.length > 0) {
            const p = pac[0];
            console.log("\n--- MIS DATOS PERSONALES ---");
            console.log(`INE: ${p.ine}`);
            console.log(`Nombre: ${p.nombre}`);
            console.log(`Correo: ${p.correo}`);
            console.log(`Fecha Nacimiento: ${p.fecha_nacimiento.toISOString().slice(0,10)}`);
            console.log(`Medico de Cabecera: ${p.medico_nombre} (${p.especialidad})`);
            console.log("----------------------------");
        }
        // Nota: si "pac.length" fuera 0 (el paciente no se encuentra en
        // la BD), aqui no se muestra ningun mensaje de error; podria
        // agregarse un "else" con un aviso para el usuario.
    } catch (error) {
        console.error("\n[ERROR] No se pudieron obtener tus datos:", error.message);
    }
}

// Muestra las citas medicas del paciente que tiene la sesion iniciada,
// ordenadas por fecha y hora, junto con el nombre del medico de cada cita.
async function verCitasPaciente() {
    try {
        const [citas] = await connection.query(
            `SELECT c.fecha, c.hora, c.detalles_consulta, p.nombre AS medico_nombre 
             FROM cita c 
             JOIN persona p ON c.ine_medico = p.ine 
             WHERE c.ine_paciente = ? 
             ORDER BY c.fecha, c.hora`,
            [usuarioActivo.ine]
        );

        console.log("\n--- MIS CITAS MEDICAS ---");
        if (citas.length === 0) {
            console.log("No tienes citas programadas.");
        } else {
            citas.forEach(c => {
                console.log(`Fecha: ${c.fecha.toISOString().slice(0,10)} | Hora: ${c.hora} | Medico: ${c.medico_nombre} | Motivo: ${c.detalles_consulta}`);
            });
        }
        console.log("-------------------------");
    } catch (error) {
        console.error("\n[ERROR] No se pudieron consultar tus citas:", error.message);
    }
}

// ============================================================================
// BUCLE PRINCIPAL DE LA APLICACION (Por: Mareli Villada Cartas)
// ============================================================================

async function main() {
    await inicializarBD();

    let terminar = false;
    while (!terminar) {
        console.log("\n=========================================");
        console.log("      SISTEMA DE CONSULTORIO MEDICO");
        console.log("=========================================");
        console.log("1. Iniciar sesion");
        console.log("0. Salir del sistema");
        
        const opcion = (await rl.question("Seleccione una opcion: ")).trim();

        if (opcion === '1') {
            let accesoConcedido = false;
            let parseIntentos = 0;
            const maxIntentos = 3;

            while (!accesoConcedido && parseIntentos < maxIntentos) {
                parseIntentos++;
                accesoConcedido = await iniciarSesion();
                if (!accesoConcedido && parseIntentos < maxIntentos) {
                    console.log(`Te quedan ${maxIntentos - parseIntentos} intento(s) restante(s).`);
                }
            }

            if (accesoConcedido) {
                // Redirigir segun el rol de la persona
                const rolLower = usuarioActivo.rol.toLowerCase();
                if (rolLower === 'administrador') {
                    await menuAdmin();
                } else if (rolLower === 'recepcionista') {
                    await menuRecepcionista();
                } else if (rolLower === 'medico') {
                    await menuMedico();
                } else if (rolLower === 'paciente') {
                    await menuPaciente();
                }
            } else {
                console.log("\n[ACCESO DENEGADO] Regresando al menu de inicio...");
            }
        } else if (opcion === '0') {
            console.log("\nSaliendo del sistema de forma segura. ¡Hasta luego!");
            terminar = true;
        } else {
            console.log("\n[ERROR] Opcion no valida.");
        }
    }

    if (connection) {
        await connection.end();
    }
    rl.close();
    process.exit(0);
}

main();

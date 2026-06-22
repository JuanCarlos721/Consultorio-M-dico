#include <fstream>
#include <functional> // Necesario para el algoritmo Hash (std::hash)
#include <iostream>
#include <sstream> // Necesario para parsing de strings (stringstream)
#include <string>
#include <vector>

using namespace std;

// 1. ESTRUCTURAS DE DATOS BASE
struct Paciente {
  int id;
  string nombre;
  string telefono;
};

struct Usuario {
  string username;
  size_t passwordHash;
};

// Bases de datos temporales en memoria (Vectores)
vector<Paciente> listaPacientes;
vector<Usuario> listaUsuarios;

// =========================================================
// MODULO JUAN CARLOS: HASH Y LOGIN (Tareas 1.2 y 1.3)
// =========================================================

// Funcion que toma un string y devuelve un codigo Hash encriptado
size_t generarHash(string password) {
  hash<string> hasher;
  return hasher(password);
}

// Simulador rapido de creacion de usuario
void registrarUsuarioPrueba() {
  Usuario admin;
  admin.username = "admin";
  admin.passwordHash = generarHash("1234"); // Encripta "1234"
  listaUsuarios.push_back(admin);
}

// Funcion para iniciar sesion (Juan Carlos - Tarea 1.3)
bool iniciarSesion() {
  string username, password;
  cout << "\n=========================================\n";
  cout << "           INICIO DE SESION\n";
  cout << "=========================================\n";
  cout << "Usuario: ";
  cin >> username;
  cout << "Contrasena: ";
  cin >> password;

  size_t hashInput = generarHash(password);
  for (const auto &u : listaUsuarios) {
    if (u.username == username && u.passwordHash == hashInput) {
      cout << "\n[ACCESO] Bienvenido al sistema, " << username << "!\n";
      return true;
    }
  }
  cout << "\n[ERROR] Usuario o contrasena incorrectos.\n";
  return false;
}

// =========================================================
// MODULO JUAN JOSE: ARCHIVOS LOCALES (Tareas 1.1 y 1.4)
// =========================================================

// Funcion para guardar el vector de pacientes en un .txt
void guardarPacientes() {
  ofstream archivo("pacientes.txt");
  if (archivo.is_open()) {
    for (const auto &p : listaPacientes) {
      // Guardamos separado por comas
      archivo << p.id << "," << p.nombre << "," << p.telefono << "\n";
    }
    archivo.close();
    cout << "\n[EXITO] Datos de pacientes guardados en 'pacientes.txt'.\n";
  } else {
    cout << "\n[ERROR] No se pudo abrir el archivo para guardar.\n";
  }
}

// Funcion para leer (cargarPacientes) al iniciar (Juan Jose - Tarea 1.1)
void cargarPacientes() {
  ifstream archivo("pacientes.txt");
  if (archivo.is_open()) {
    listaPacientes.clear(); // Limpiar lista existente
    string linea;
    while (getline(archivo, linea)) {
      if (linea.empty())
        continue;
      stringstream ss(linea);
      string id_str, nombre, telefono;
      if (getline(ss, id_str, ',') && getline(ss, nombre, ',') &&
          getline(ss, telefono)) {
        Paciente p;
        try {
          p.id = stoi(id_str);
          p.nombre = nombre;
          p.telefono = telefono;
          listaPacientes.push_back(p);
        } catch (...) {
          // Ignorar lineas corruptas o mal formateadas
        }
      }
    }
    archivo.close();
    cout << "\n[PERSISTENCIA] Se cargaron " << listaPacientes.size()
         << " pacientes desde 'pacientes.txt'.\n";
  } else {
    cout << "\n[PERSISTENCIA] No se encontro archivo 'pacientes.txt' (se "
            "iniciara con lista vacia).\n";
  }
}

// =========================================================
// MODULO: MENUS Y REGISTRO (Tareas 2.1)
// =========================================================

void registrarPaciente() {
  Paciente p;
  cout << "\n--- REGISTRO DE NUEVO PACIENTE ---\n";
  while (true) {
    cout << "ID (Numerico): ";
    cin >> p.id;
    if (cin.fail()) {
      cin.clear();
      cin.ignore(10000, '\n');
      cout << "[ERROR] ID debe ser un numero entero. Intente de nuevo.\n";
    } else {
      cin.ignore(); // Limpiar el buffer del salto de linea
      break;
    }
  }

  cout << "Nombre completo: ";
  getline(cin, p.nombre);

  cout << "Telefono: ";
  getline(cin, p.telefono);

  listaPacientes.push_back(p);
  cout << "[EXITO] Paciente registrado temporalmente en memoria.\n";
}

void mostrarPacientes() {
  cout << "\n--- LISTA DE PACIENTES REGISTRADOS ---\n";
  if (listaPacientes.empty()) {
    cout << "No hay pacientes registrados en el sistema.\n";
    return;
  }
  for (const auto &p : listaPacientes) {
    cout << "ID: " << p.id << " | Nombre: " << p.nombre
         << " | Telefono: " << p.telefono << "\n";
  }
}

void menuPrincipal() {
  int opcion;
  do {
    cout << "\n=== SISTEMA DE CONSULTORIO MEDICO ===\n";
    cout << "1. Registrar nuevo paciente\n";
    cout << "2. Guardar datos en archivo (Prueba persistencia)\n";
    cout << "3. Ver pacientes registrados\n";
    cout << "0. Salir y cerrar sistema\n";
    cout << "Seleccione una opcion: ";
    cin >> opcion;

    if (cin.fail()) {
      cin.clear();
      cin.ignore(10000, '\n');
      opcion = -1; // Forzar opcion no valida
    }

    switch (opcion) {
    case 1:
      registrarPaciente();
      break;
    case 2:
      guardarPacientes();
      break;
    case 3:
      mostrarPacientes();
      break;
    case 0:
      cout << "\nGuardando de forma automatica y saliendo del sistema de forma "
              "segura...\n";
      guardarPacientes(); // Tarea 1.4: Guardado automático al salir
      break;
    default:
      cout << "\n[ERROR] Opcion no valida.\n";
    }
  } while (opcion != 0);
}

// =========================================================
// EJECUCION PRINCIPAL DEL PROGRAMA
// =========================================================
int main() {
  // 1. Inicializar datos
  registrarUsuarioPrueba();

  // Tarea 1.1: Carga de archivos al iniciar
  cargarPacientes();

  // Tarea 1.3: Login de seguridad
  bool accesoConcedido = false;
  int intentos = 0;
  const int maxIntentos = 3;

  while (!accesoConcedido && intentos < maxIntentos) {
    intentos++;
    if (iniciarSesion()) {
      accesoConcedido = true;
    } else {
      if (intentos < maxIntentos) {
        cout << "Te quedan " << (maxIntentos - intentos)
             << " intento(s) restante(s).\n";
      }
    }
  }

  if (!accesoConcedido) {
    cout << "\n[ACCESO DENEGADO] Demasiados intentos fallidos. Cerrando "
            "aplicacion...\n";
    return 0;
  }

  // 2. Mostrar interfaz principal
  menuPrincipal();

  return 0;
}
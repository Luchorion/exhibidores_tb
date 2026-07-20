// Datos por defecto y catálogos fijos de la congregación Talleres Boulogne.

export const DEFAULT_PUNTOS = [
  { id: "p1", nombre: "Márquez y Panamericana", observaciones: "Elegible para puntos simultáneos. Evitar por la mañana hermanas solas." },
  { id: "p2", nombre: "Thames y Panamericana", observaciones: "Elegible para puntos simultáneos. Mayor movimiento en horario de ida y vuelta laborable." },
  { id: "p3", nombre: "Hospital de Boulogne", observaciones: "Estar atentos a la situación epidemiológica de la zona y preguntar a hermanos antes de asignar si están dispuestos." },
  { id: "p4", nombre: "Clínica Las Lomas", observaciones: "Analizar mismas sugerencias que Hospital (este punto no se utilizó hasta el momento)." },
  { id: "p5", nombre: "Estación Boulogne", observaciones: "Puntos simultáneos, atención con la seguridad de hermanas, no recomendable para jovencitas solas." },
  { id: "p6", nombre: "Entrada del Golf", observaciones: "Circulación por las tardes y mucha en los fines de semana, mayormente por la tarde." },
  { id: "p7", nombre: "Parque San Martín", observaciones: "Buen movimiento en entrada y salida del colegio. También por la tarde en días de clima agradable." },
  { id: "p8", nombre: "Parque Arenas", observaciones: "2 entradas. Mayor movimiento sobre Godoy Cruz y Lamadrid, poco espacio para exhibidor. Circulación por Lamadrid y Bomberos." },
  { id: "p9", nombre: "Rotonda Fleming", observaciones: "Buen movimiento durante la época de verano (septiembre a marzo)." },
];

export const DEFAULT_CARRITOS = [
  { id: "c1", numero: 1, estado: "operativo", ubicacion: "", ultimoControlFisico: "", ultimaRevisionPublicaciones: "", notas: "" },
  { id: "c2", numero: 2, estado: "operativo", ubicacion: "", ultimoControlFisico: "", ultimaRevisionPublicaciones: "", notas: "" },
  { id: "c3", numero: 3, estado: "operativo", ubicacion: "", ultimoControlFisico: "", ultimaRevisionPublicaciones: "", notas: "" },
  { id: "c4", numero: 4, estado: "operativo", ubicacion: "", ultimoControlFisico: "", ultimaRevisionPublicaciones: "", notas: "" },
  { id: "c5", numero: 5, estado: "operativo", ubicacion: "", ultimoControlFisico: "", ultimaRevisionPublicaciones: "", notas: "" },
  { id: "c6", numero: 6, estado: "repuesto", ubicacion: "", ultimoControlFisico: "", ultimaRevisionPublicaciones: "", notas: "" },
  { id: "c7", numero: 7, estado: "repuesto", ubicacion: "", ultimoControlFisico: "", ultimaRevisionPublicaciones: "", notas: "" },
  { id: "c8", numero: 8, estado: "pendiente", ubicacion: "Betel", ultimoControlFisico: "", ultimaRevisionPublicaciones: "", notas: "Pendiente de recepción." },
];

export const DEFAULT_HERMANOS = [];

export const UBICACIONES_SUGERIDAS = ["Salón del Reino", "Familia Almada", "Flia. Di Caprio", "Maria Graziano", "Pablo Carricaburo"];
export const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
export const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
export const FRECUENCIAS = ["Semanal", "Quincenal", "Mensual"];
export const FRANJAS = ["mañana", "mediodía", "tarde", "noche"];
export const ESTADOS_HERMANO = [
  { value: "aprobado", label: "Aprobado" },
  { value: "pendiente", label: "Pendiente" },
  { value: "no_aprobado", label: "No aprobado" },
];
export const ESTADOS_TURNO = [
  { value: "confirmado", label: "Confirmado" },
  { value: "propuesto", label: "Propuesto" },
];
export const DIAS_CONTROL_FISICO = 15;
export const DIAS_REVISION_PUBLICACIONES = 60;

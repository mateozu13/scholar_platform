export interface Test {
  id: string;
  courseId: string;
  titulo: string;
  descripcion: string;
  fechaInicio?: Date;
  fechaCierre: Date;
  duracion?: number; // en minutos
  intentosPermitidos?: number;
  puntosTotales: number;
}

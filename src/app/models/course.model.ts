export interface Course {
  id: string;
  titulo: string;
  descripcion: string;
  profesorId: string;
  profesorNombre?: string; // Campo calculado
  estudiantes?: string[]; // IDs de estudiantes
  estudiantesCount?: number; // Campo calculado
  fechaInicio?: Date;
  fechaFin?: Date;
  nivel?: string;
  imagenUrl?: string;
  assignmentsCount?: number; // Campo calculado
  completedAssignments?: number; // Campo calculado
  deliveredSubmissions?: number; // Campo calculado
  pendingSubmissions?: number; // Campo calculado
  avgGrade?: number;
}

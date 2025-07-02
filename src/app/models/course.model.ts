import { User } from './user.model';

export interface Course {
  id: string;
  titulo: string;
  descripcion: string;
  profesorId: string;
  profesor?: User;
  profesorNombre?: string;
  estudiantes?: User[];
  estudiantesCount?: number; // Campo calculado (número de estudiantes)
  fechaInicio?: Date;
  fechaFin?: Date;
  nivel?: string;
  imagenUrl?: string;
  assignmentsCount?: number; // Campo calculado
  completedAssignments?: number; // Campo calculado
  deliveredSubmissions?: number; // Campo calculado
  pendingSubmissions?: number; // Campo calculado
  avgGrade?: number;
  activo?: boolean; // Campo añadido para indicar si el curso está activo
}

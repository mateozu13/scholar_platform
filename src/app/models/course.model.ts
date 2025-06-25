export interface Course {
  id: string;
  titulo: string;
  descripcion: string;
  profesorId: string;
  estudiantes?: string[]; // IDs de estudiantes
  fechaInicio?: Date;
  fechaFin?: Date;
  precio?: number;
  categoria?: string;
  nivel?: string;
  imagenUrl?: string;
  profesorNombre?: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  fechaInscripcion: Date;
  progreso?: number;
  calificacionFinal?: number;
}

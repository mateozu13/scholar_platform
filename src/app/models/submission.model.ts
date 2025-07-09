export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  archivoURL: string;
  fechaEnvio: Date;
  calificacion?: number;
  retroalimentacion?: string;
  late?: boolean;
}

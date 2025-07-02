export interface Assignment {
  id: string;
  courseId: string;
  titulo: string;
  descripcion: string;
  fechaEntrega: Date;
  puntosMaximos?: number;
  adjuntos?: string[]; // URLs de archivos adjuntos
  submissions?: string[];
  status?: 'draft' | 'published' | 'submitted' | 'graded';
  studentPhoto?: string;
  studentName?: string;
  courseTitle?: string;
  submissionDate?: Date;
  createdAt?: Date;
}

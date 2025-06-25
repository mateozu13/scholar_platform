export interface Assignment {
  id: string;
  courseId: string;
  titulo: string;
  descripcion: string;
  fechaEntrega: Date;
  puntosMaximos?: number;
  adjuntos?: string[]; // URLs de archivos adjuntos
}

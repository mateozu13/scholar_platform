export interface CourseMaterial {
  id: string;
  courseId: string;
  titulo: string;
  urlArchivo: string;
  tipo: 'documento' | 'video' | 'presentacion' | 'otro';
  fechaPublicacion: Date;
  publicadoPor: string; // ID del profesor
}

export interface QuizAttempt {
  id: string;
  testId: string;
  studentId: string;
  score: number;
  respuestas: { [questionId: string]: string };
  fechaEnvio: Date;
  duracionUtilizada?: number; // en minutos
  aprobado?: boolean;
}

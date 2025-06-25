export interface Question {
  id: string;
  testId: string;
  texto: string;
  tipo: 'opcion_multiple' | 'verdadero_falso' | 'respuesta_corta';
  opciones?: string[];
  respuestaCorrecta: string | number;
  puntaje: number;
}

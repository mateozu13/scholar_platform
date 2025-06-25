export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: 'estudiante' | 'profesor' | 'admin';
  cursosInscritos?: string[]; // IDs de cursos (para estudiantes)
  cursosDictados?: string[]; // IDs de cursos (para profesores)
  fotoPerfil?: string;
  telefono?: string;
  bio?: string;
  createdAt: Date;
}

export type UserRole = User['rol'];

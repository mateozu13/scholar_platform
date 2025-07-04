import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Course } from 'src/app/models/course.model';
import { CourseService } from 'src/app/services/course.service';
import { TaskService } from 'src/app/services/task.service';
import { Assignment } from 'src/app/models/assignment.model';
import { Submission } from 'src/app/models/submission.model';
import { AlertController } from '@ionic/angular';
import { UserService } from 'src/app/services/user.service';
import { QuizService } from 'src/app/services/quiz.service';

type SubmissionWithName = Submission & { studentName?: string };

@Component({
  selector: 'app-course-detail',
  templateUrl: './course-detail.page.html',
  styleUrls: ['./course-detail.page.scss'],
  standalone: false,
})
export class CourseDetailPage implements OnInit {
  courseId = '';
  course: Course | null = null;
  loading = true;

  assignments: Assignment[] = [];
  submissionsByAssignment: { [assignmentId: string]: SubmissionWithName[] } =
    {};
  submissions: any[] = [];

  quizzes: any[] = [];
  quizResultsByQuiz: { [quizId: string]: any[] } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private taskService: TaskService,
    private alertCtrl: AlertController,
    private userService: UserService,
    private quizService: QuizService
  ) {}

  async ngOnInit() {
    this.courseId = this.route.snapshot.paramMap.get('courseId') || '';
    if (!this.courseId) {
      this.router.navigate(['/teacher/courses-list']);
      return;
    }

    try {
      this.course = await this.courseService.getCourseById(this.courseId);
      this.assignments = await this.taskService.getAssignmentsByCourse(
        this.courseId
      );

      for (const assignment of this.assignments) {
        const submissions = await this.taskService.getSubmissionsByAssignment(
          assignment.id
        );
        this.submissionsByAssignment[assignment.id] = submissions;
      }

      await this.cargarEntregas();

      this.quizzes = await this.quizService.getTestsByCourse(this.courseId);
      for (const quiz of this.quizzes) {
        const attempts = await this.quizService.getAttemptsByTest(quiz.id);
        this.quizResultsByQuiz[quiz.id] = [];

        for (const attempt of attempts) {
          const estudiante = await this.userService.getUserById(
            attempt.studentId
          );
          this.quizResultsByQuiz[quiz.id].push({
            ...attempt,
            studentName: estudiante?.nombre || 'Desconocido',
          });
        }
      }
    } catch (error) {
      console.error('Error al cargar datos del curso:', error);
      this.router.navigate(['/teacher/courses-list']);
    } finally {
      this.loading = false;
    }
  }

  goTo(section: string) {
    this.router.navigate([`/teacher/${section}/${this.courseId}`]);
  }

  abrirArchivo(submission: Submission) {
    if (submission.archivoURL) {
      window.open(submission.archivoURL, '_blank');
    } else {
      window.alert('No se ha subido un archivo.');
    }
  }

  parseDate(input: any): Date | null {
    if (!input) return null;
    if (typeof input.toDate === 'function') return input.toDate();
    if (input.seconds && input.nanoseconds) {
      const millis = input.seconds * 1000 + Math.floor(input.nanoseconds / 1e6);
      return new Date(millis);
    }
    return new Date(input);
  }

  async cargarEntregas() {
    this.submissions = [];

    for (const assignment of this.assignments) {
      const submissions = await this.taskService.getSubmissionsByAssignment(
        assignment.id
      );

      for (const sub of submissions) {
        const estudiante = await this.userService.getUserById(sub.studentId);
        (sub as any).studentName = estudiante?.nombre || 'Desconocido';
      }

      this.submissionsByAssignment[assignment.id] = submissions;
    }
  }

  async calificar(submission: Submission) {
    const alert = await this.alertCtrl.create({
      header: 'Calificar entrega',
      inputs: [
        {
          name: 'nota',
          type: 'number',
          placeholder: 'Nota',
          min: 0,
          max: 100,
        },
        {
          name: 'retro',
          type: 'text',
          placeholder: 'Retroalimentación',
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: async (data) => {
            try {
              await this.taskService.gradeSubmission(
                submission.id,
                +data.nota,
                data.retro
              );
              window.alert('✅ Calificación guardada');
              this.cargarEntregas();
            } catch (err) {
              console.error(err);
              window.alert('❌ Error al guardar calificación');
            }
          },
        },
      ],
    });

    await alert.present();
  }

  openChatList() {
    this.router.navigate(['/teacher/course', this.courseId, 'chats']);
  }
}

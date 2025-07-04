import { Component, OnInit } from '@angular/core';
import { QuizService } from 'src/app/services/quiz.service';
import { CourseService } from 'src/app/services/course.service';
import { AuthService } from 'src/app/services/auth.service';
import { Test } from 'src/app/models/test.model';
import { Course } from 'src/app/models/course.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-quiz-list',
  templateUrl: './quiz-list.page.html',
  styleUrls: ['./quiz-list.page.scss'],
  standalone:false
})
export class QuizListPage implements OnInit {
  quizzesByCourse: { course: Course; quizzes: Test[] }[] = [];
  isLoading = false;

  constructor(
    private quizService: QuizService,
    private courseService: CourseService,
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.isLoading = true;
    const user = await this.authService.getCurrentUser();
    const courses = await this.courseService.getCoursesByStudent(user!.id);

    for (const course of courses) {
      const quizzes = await this.quizService.getTestsByCourse(course.id);
      if (quizzes.length > 0) {
        this.quizzesByCourse.push({ course, quizzes });
      }
    }
    this.isLoading = false;
  }

  formatDate(date: any): string {
    return new Date(date).toLocaleDateString('es-EC', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  navigateToQuizDetail(quizId: string) {
    this.router.navigate(['/student/quiz-detail', quizId]);
  }
}

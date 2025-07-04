import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import { Course } from 'src/app/models/course.model';
import { User } from 'src/app/models/user.model';
import { ChatService } from 'src/app/services/chat.service';
import { CourseService } from 'src/app/services/course.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-course-users',
  templateUrl: './course-users.page.html',
  styleUrls: ['./course-users.page.scss'],
  standalone: false,
})
export class CourseUsersPage implements OnInit {
  courseId: string;
  course: Course;
  users: User[] = [];
  currentUserId: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private userService: UserService,
    private chatService: ChatService
  ) {
    this.courseId = this.route.snapshot.paramMap.get('courseId');
    this.currentUserId = firebase.auth().currentUser?.uid;
  }

  async ngOnInit() {
    await this.loadCourseUsers();
  }

  async loadCourseUsers() {
    try {
      this.course = await this.courseService.getCourseById(this.courseId);

      // Obtener profesor
      const professor = this.course.profesor;

      // Obtener estudiantes
      const students = this.course.estudiantes || [];

      // Combinar todos los usuarios, filtrando el usuario actual
      this.users = [professor, ...students].filter(
        (user) => user && user.id !== this.currentUserId
      );
    } catch (error) {
      console.error('Error loading course users:', error);
    }
  }

  getInitials(name: string): string {
    if (!name) return '';
    const parts = name.split(' ');
    return parts
      .map((p) => p[0])
      .join('')
      .toUpperCase();
  }

  async startChat(user: User) {
    const chatId = await this.chatService.getOrCreateChat(
      this.currentUserId,
      user.id,
      this.courseId
    );

    const currentUser = await this.userService.getUserById(this.currentUserId);
    const route = currentUser.rol === 'estudiante' ? 'student' : 'teacher';
    this.router.navigate([`/${route}/chat`, chatId], {
      state: {
        otherUser: user,
        courseId: this.courseId,
      },
    });
  }
}

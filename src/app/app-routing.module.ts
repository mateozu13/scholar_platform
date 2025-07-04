import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./pages/auth/login/login.module').then((m) => m.LoginPageModule),
  },
  {
    path: 'reset-password',
    loadChildren: () =>
      import('./pages/auth/reset-password/reset-password.module').then(
        (m) => m.ResetPasswordPageModule
      ),
  },

  // ADMIN
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: 'admin' },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./pages/admin/admin-dashboard/admin-dashboard.module').then(
            (m) => m.AdminDashboardPageModule
          ),
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('./pages/user/profile/profile.module').then(
            (m) => m.ProfilePageModule
          ),
      },
      {
        path: 'user-management',
        children: [
          {
            path: '',
            redirectTo: 'list',
            pathMatch: 'full',
          },
          {
            path: 'create',
            loadChildren: () =>
              import(
                './pages/admin/user-management/create-user/create-user.module'
              ).then((m) => m.CreateUserPageModule),
          },
          {
            path: 'edit/:id',
            loadChildren: () =>
              import(
                './pages/admin/user-management/edit-user/edit-user.module'
              ).then((m) => m.EditUserPageModule),
          },
          {
            path: 'list',
            loadChildren: () =>
              import(
                './pages/admin/user-management/list-user/list-user.module'
              ).then((m) => m.ListUserPageModule),
          },
        ],
      },
    ],
  },

  // STUDENT
  {
    path: 'student',
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: 'estudiante' },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import(
            './pages/student/student-dashboard/student-dashboard.module'
          ).then((m) => m.StudentDashboardPageModule),
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('./pages/user/profile/profile.module').then(
            (m) => m.ProfilePageModule
          ),
      },
      {
        path: 'courses-list',
        loadChildren: () =>
          import('./pages/student/courses-list/courses-list.module').then(
            (m) => m.CoursesListPageModule
          ),
      },

      {
        path: 'task-list',
        loadChildren: () =>
          import('./pages/student/task-list/task-list.module').then(
            (m) => m.TaskListPageModule
          ),
      },
      {
        path: 'course-detail/:courseId',
        loadChildren: () =>
          import('./pages/student/course-detail/course-detail.module').then(
            (m) => m.CourseDetailPageModule
          ),
      },
      {
        path: 'task-detail/:taskId',
        loadChildren: () =>
          import('./pages/student/task-detail/task-detail.module').then(
            (m) => m.TaskDetailPageModule
          ),
      },
      {
        path: 'task-submit/:taskId',
        loadChildren: () =>
          import('./pages/student/task-submit/task-submit.module').then(
            (m) => m.TaskSubmitPageModule
          ),
      },
      {
        path: 'quiz-list',
        loadChildren: () =>
          import('./pages/student/quiz-list/quiz-list.module').then(
            (m) => m.QuizListPageModule
          ),
      },

      {
        path: 'quiz-detail/:quizId',
        loadChildren: () =>
          import('./pages/student/quiz-detail/quiz-detail.module').then(
            (m) => m.QuizDetailPageModule
          ),
      },
      {
        path: 'quiz-attempt/:quizId',
        loadChildren: () =>
          import('./pages/student/quiz-attempt/quiz-attempt.module').then(
            (m) => m.QuizAttemptPageModule
          ),
      },

      {
        path: 'course/:courseId/chats',
        loadChildren: () =>
          import('./pages/user/chat-list/chat-list.module').then(
            (m) => m.ChatListPageModule
          ),
      },
      {
        path: 'course/:courseId/users',
        loadChildren: () =>
          import('./pages/user/course-users/course-users.module').then(
            (m) => m.CourseUsersPageModule
          ),
      },
      {
        path: 'chat/:chatId',
        loadChildren: () =>
          import('./pages/user/chat/chat.module').then((m) => m.ChatPageModule),
      },
      {
        path: 'material-course',
        loadChildren: () => import('./pages/student/material-course/material-course.module').then(m => m.MaterialCoursePageModule)
      },
    ],
  },

  // TEACHER
  {
    path: 'teacher',
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: 'profesor' },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import(
            './pages/teacher/teacher-dashboard/teacher-dashboard.module'
          ).then((m) => m.TeacherDashboardPageModule),
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('./pages/teacher/profile/profile.module').then(
            (m) => m.ProfilePageModule
          ),
      },
      {
        path: 'courses-list',
        loadChildren: () =>
          import('./pages/teacher/courses-list/courses-list.module').then(
            (m) => m.CoursesListPageModule
          ),
      },
      {
        path: 'course-detail/:courseId',
        loadChildren: () =>
          import('./pages/teacher/course-detail/course-detail.module').then(
            (m) => m.CourseDetailPageModule
          ),
      },
      {
        path: 'material-upload/:courseId',
        loadChildren: () =>
          import('./pages/teacher/material-upload/material-upload.module').then(
            (m) => m.MaterialUploadPageModule
          ),
      },
      {
        path: 'task-create/:courseId',
        loadChildren: () =>
          import('./pages/teacher/task-create/task-create.module').then(
            (m) => m.TaskCreatePageModule
          ),
      },
      {
        path: 'task-detail/:taskId',
        loadChildren: () =>
          import('./pages/teacher/task-detail/task-detail.module').then(
            (m) => m.TaskDetailPageModule
          ),
      },
      {
        path: 'submission-review/:submissionId',
        loadChildren: () =>
          import(
            './pages/teacher/submission-review/submission-review.module'
          ).then((m) => m.SubmissionReviewPageModule),
      },
      {
        path: 'quiz-create/:courseId',
        loadChildren: () =>
          import('./pages/teacher/quiz-create/quiz-create.module').then(
            (m) => m.QuizCreatePageModule
          ),
      },
      {
        path: 'quiz-detail/:quizId',
        loadChildren: () =>
          import('./pages/teacher/quiz-detail/quiz-detail.module').then(
            (m) => m.QuizDetailPageModule
          ),
      },
      {
        path: 'quiz-review/:quizId',
        loadChildren: () =>
          import('./pages/teacher/quiz-review/quiz-review.module').then(
            (m) => m.QuizReviewPageModule
          ),
      },
      {
        path: 'course/:courseId/chats',
        loadChildren: () =>
          import('./pages/user/chat-list/chat-list.module').then(
            (m) => m.ChatListPageModule
          ),
      },
      {
        path: 'course/:courseId/users',
        loadChildren: () =>
          import('./pages/user/course-users/course-users.module').then(
            (m) => m.CourseUsersPageModule
          ),
      },
      {
        path: 'chat/:chatId',
        loadChildren: () =>
          import('./pages/user/chat/chat.module').then((m) => m.ChatPageModule),
      },
    ],
  },

  // Ruta predeterminada
  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full',
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule { }

import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/auth/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'list',
    loadChildren: () => import('./pages/auth/user-management/list/list.module').then( m => m.ListPageModule)
  },
  {
    path: 'create',
    loadChildren: () => import('./pages/auth/user-management/create/create.module').then( m => m.CreatePageModule)
  },
  {
    path: 'edit',
    loadChildren: () => import('./pages/auth/user-management/edit/edit.module').then( m => m.EditPageModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/student/dashboard/dashboard.module').then( m => m.DashboardPageModule)
  },
  {
    path: 'courses-list',
    loadChildren: () => import('./pages/student/courses-list/courses-list.module').then( m => m.CoursesListPageModule)
  },
  {
    path: 'course-detail',
    loadChildren: () => import('./pages/student/course-detail/course-detail.module').then( m => m.CourseDetailPageModule)
  },
  {
    path: 'task-list',
    loadChildren: () => import('./pages/student/task-list/task-list.module').then( m => m.TaskListPageModule)
  },
  {
    path: 'task-detail',
    loadChildren: () => import('./pages/student/task-detail/task-detail.module').then( m => m.TaskDetailPageModule)
  },
  {
    path: 'task-submit',
    loadChildren: () => import('./pages/student/task-submit/task-submit.module').then( m => m.TaskSubmitPageModule)
  },
  {
    path: 'quiz-list',
    loadChildren: () => import('./pages/student/quiz-list/quiz-list.module').then( m => m.QuizListPageModule)
  },
  {
    path: 'quiz-detail',
    loadChildren: () => import('./pages/student/quiz-detail/quiz-detail.module').then( m => m.QuizDetailPageModule)
  },
  {
    path: 'quiz-attempt',
    loadChildren: () => import('./pages/student/quiz-attempt/quiz-attempt.module').then( m => m.QuizAttemptPageModule)
  },
  {
    path: 'chat-list',
    loadChildren: () => import('./pages/student/chat-list/chat-list.module').then( m => m.ChatListPageModule)
  },
  {
    path: 'chat-detail',
    loadChildren: () => import('./pages/student/chat-detail/chat-detail.module').then( m => m.ChatDetailPageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./pages/student/profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/teacher/dashboard/dashboard.module').then( m => m.DashboardPageModule)
  },
  {
    path: 'courses-list',
    loadChildren: () => import('./pages/teacher/courses-list/courses-list.module').then( m => m.CoursesListPageModule)
  },
  {
    path: 'course-detail',
    loadChildren: () => import('./pages/teacher/course-detail/course-detail.module').then( m => m.CourseDetailPageModule)
  },
  {
    path: 'material-upload',
    loadChildren: () => import('./pages/teacher/material-upload/material-upload.module').then( m => m.MaterialUploadPageModule)
  },
  {
    path: 'task-create',
    loadChildren: () => import('./pages/teacher/task-create/task-create.module').then( m => m.TaskCreatePageModule)
  },
  {
    path: 'task-detail',
    loadChildren: () => import('./pages/teacher/task-detail/task-detail.module').then( m => m.TaskDetailPageModule)
  },
  {
    path: 'submission-review',
    loadChildren: () => import('./pages/teacher/submission-review/submission-review.module').then( m => m.SubmissionReviewPageModule)
  },
  {
    path: 'quiz-create',
    loadChildren: () => import('./pages/teacher/quiz-create/quiz-create.module').then( m => m.QuizCreatePageModule)
  },
  {
    path: 'quiz-detail',
    loadChildren: () => import('./pages/teacher/quiz-detail/quiz-detail.module').then( m => m.QuizDetailPageModule)
  },
  {
    path: 'quiz-review',
    loadChildren: () => import('./pages/teacher/quiz-review/quiz-review.module').then( m => m.QuizReviewPageModule)
  },
  {
    path: 'chat-list',
    loadChildren: () => import('./pages/teacher/chat-list/chat-list.module').then( m => m.ChatListPageModule)
  },
  {
    path: 'chat-detail',
    loadChildren: () => import('./pages/teacher/chat-detail/chat-detail.module').then( m => m.ChatDetailPageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./pages/teacher/profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/admin/dashboard/dashboard.module').then( m => m.DashboardPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

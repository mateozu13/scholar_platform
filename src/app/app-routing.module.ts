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
          import('./pages/user/profile/profile.module').then(
            (m) => m.ProfilePageModule
          ),
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
export class AppRoutingModule {}

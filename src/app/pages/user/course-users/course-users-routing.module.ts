import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CourseUsersPage } from './course-users.page';

const routes: Routes = [
  {
    path: '',
    component: CourseUsersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CourseUsersPageRoutingModule {}

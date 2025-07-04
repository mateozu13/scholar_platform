import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MaterialCoursePage } from './material-course.page';

const routes: Routes = [
  {
    path: '',
    component: MaterialCoursePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MaterialCoursePageRoutingModule {}

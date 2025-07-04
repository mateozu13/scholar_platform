import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TaskSubmitPage } from './task-submit.page';

const routes: Routes = [
  {
    path: '',
    component: TaskSubmitPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TaskSubmitPageRoutingModule {}

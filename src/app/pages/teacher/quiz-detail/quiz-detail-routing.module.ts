import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QuizDetailPage } from './quiz-detail.page';

const routes: Routes = [
  {
    path: '',
    component: QuizDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuizDetailPageRoutingModule {}

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QuizReviewPage } from './quiz-review.page';

const routes: Routes = [
  {
    path: '',
    component: QuizReviewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuizReviewPageRoutingModule {}

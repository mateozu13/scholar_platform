import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SubmissionReviewPage } from './submission-review.page';

const routes: Routes = [
  {
    path: '',
    component: SubmissionReviewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SubmissionReviewPageRoutingModule {}

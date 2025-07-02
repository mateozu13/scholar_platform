import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QuizReviewPageRoutingModule } from './quiz-review-routing.module';

import { QuizReviewPage } from './quiz-review.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QuizReviewPageRoutingModule
  ],
  declarations: [QuizReviewPage]
})
export class QuizReviewPageModule {}

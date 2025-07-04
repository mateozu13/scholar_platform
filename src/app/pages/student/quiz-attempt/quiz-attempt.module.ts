import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QuizAttemptPageRoutingModule } from './quiz-attempt-routing.module';

import { QuizAttemptPage } from './quiz-attempt.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QuizAttemptPageRoutingModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [QuizAttemptPage]
})
export class QuizAttemptPageModule {}

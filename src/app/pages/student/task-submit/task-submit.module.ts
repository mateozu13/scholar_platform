import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TaskSubmitPageRoutingModule } from './task-submit-routing.module';

import { TaskSubmitPage } from './task-submit.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TaskSubmitPageRoutingModule
  ],
  declarations: [TaskSubmitPage]
})
export class TaskSubmitPageModule {}

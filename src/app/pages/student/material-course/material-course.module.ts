import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MaterialCoursePageRoutingModule } from './material-course-routing.module';

import { MaterialCoursePage } from './material-course.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MaterialCoursePageRoutingModule
  ],
  declarations: [MaterialCoursePage]
})
export class MaterialCoursePageModule {}

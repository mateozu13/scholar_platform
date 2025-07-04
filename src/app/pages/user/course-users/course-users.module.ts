import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CourseUsersPageRoutingModule } from './course-users-routing.module';

import { CourseUsersPage } from './course-users.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CourseUsersPageRoutingModule
  ],
  declarations: [CourseUsersPage]
})
export class CourseUsersPageModule {}

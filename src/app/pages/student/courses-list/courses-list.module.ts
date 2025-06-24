import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CoursesListPageRoutingModule } from './courses-list-routing.module';

import { CoursesListPage } from './courses-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CoursesListPageRoutingModule
  ],
  declarations: [CoursesListPage]
})
export class CoursesListPageModule {}

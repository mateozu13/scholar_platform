import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MaterialUploadPageRoutingModule } from './material-upload-routing.module';

import { MaterialUploadPage } from './material-upload.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MaterialUploadPageRoutingModule
  ],
  declarations: [MaterialUploadPage]
})
export class MaterialUploadPageModule {}

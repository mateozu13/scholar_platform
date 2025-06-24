import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MaterialUploadPage } from './material-upload.page';

const routes: Routes = [
  {
    path: '',
    component: MaterialUploadPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MaterialUploadPageRoutingModule {}

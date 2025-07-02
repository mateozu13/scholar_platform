import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialUploadPage } from './material-upload.page';

describe('MaterialUploadPage', () => {
  let component: MaterialUploadPage;
  let fixture: ComponentFixture<MaterialUploadPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialUploadPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

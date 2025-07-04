import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialCoursePage } from './material-course.page';

describe('MaterialCoursePage', () => {
  let component: MaterialCoursePage;
  let fixture: ComponentFixture<MaterialCoursePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialCoursePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

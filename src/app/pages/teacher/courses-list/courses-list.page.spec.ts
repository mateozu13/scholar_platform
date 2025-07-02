import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CoursesListPage } from './courses-list.page';

describe('CoursesListPage', () => {
  let component: CoursesListPage;
  let fixture: ComponentFixture<CoursesListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CoursesListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

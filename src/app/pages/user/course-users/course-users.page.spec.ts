import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CourseUsersPage } from './course-users.page';

describe('CourseUsersPage', () => {
  let component: CourseUsersPage;
  let fixture: ComponentFixture<CourseUsersPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseUsersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

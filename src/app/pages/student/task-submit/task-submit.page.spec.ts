import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskSubmitPage } from './task-submit.page';

describe('TaskSubmitPage', () => {
  let component: TaskSubmitPage;
  let fixture: ComponentFixture<TaskSubmitPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskSubmitPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

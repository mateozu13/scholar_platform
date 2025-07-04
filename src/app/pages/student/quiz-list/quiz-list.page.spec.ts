import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuizListPage } from './quiz-list.page';

describe('QuizListPage', () => {
  let component: QuizListPage;
  let fixture: ComponentFixture<QuizListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(QuizListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuizAttemptPage } from './quiz-attempt.page';

describe('QuizAttemptPage', () => {
  let component: QuizAttemptPage;
  let fixture: ComponentFixture<QuizAttemptPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(QuizAttemptPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

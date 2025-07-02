import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuizReviewPage } from './quiz-review.page';

describe('QuizReviewPage', () => {
  let component: QuizReviewPage;
  let fixture: ComponentFixture<QuizReviewPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(QuizReviewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

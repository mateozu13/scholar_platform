import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuizDetailPage } from './quiz-detail.page';

describe('QuizDetailPage', () => {
  let component: QuizDetailPage;
  let fixture: ComponentFixture<QuizDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(QuizDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

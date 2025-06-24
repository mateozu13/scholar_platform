import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuizCreatePage } from './quiz-create.page';

describe('QuizCreatePage', () => {
  let component: QuizCreatePage;
  let fixture: ComponentFixture<QuizCreatePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(QuizCreatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

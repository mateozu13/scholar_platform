import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubmissionReviewPage } from './submission-review.page';

describe('SubmissionReviewPage', () => {
  let component: SubmissionReviewPage;
  let fixture: ComponentFixture<SubmissionReviewPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmissionReviewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

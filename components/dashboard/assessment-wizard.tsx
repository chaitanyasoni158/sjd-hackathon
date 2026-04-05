"use client";

import { useMemo, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const questions = [
  "How often have you felt overwhelmed by daily responsibilities?",
  "How difficult has it been to quiet anxious thoughts at night?",
  "How often have you felt down, low-energy, or disconnected?",
  "How supported and able to cope have you felt this week?",
  "How often have racing or restless thoughts interrupted your focus?",
  "How often have you felt unusually tense or on edge?",
  "How often have sleep issues left you feeling drained the next day?",
  "How often have you missed social activities because of low mood?",
  "How often have you found it hard to enjoy things you usually like?",
  "How often have you felt confident in handling problems today?",
];

const options = [
  "Not at all",
  "Several days",
  "More than half the days",
  "Nearly every day",
];

export function AssessmentWizard({ initialAnswers }: { initialAnswers?: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(
    initialAnswers?.length === questions.length
      ? initialAnswers
      : Array(questions.length).fill(options[0]),
  );

  const currentAnswer = answers[currentIndex];

  const progress = useMemo(
    () => Math.round(((currentIndex + 1) / questions.length) * 100),
    [currentIndex],
  );

  const handleAnswerChange = (value: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = value;
      return next;
    });
  };

  const goNext = () => {
    setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1));
  };

  const goBack = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assessment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="progress-bar-wrap" style={{ marginBottom: 18 }}>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-label">Question {currentIndex + 1} of {questions.length}</div>
        </div>

        <div className="question-card">
          <div className="question-text">{questions[currentIndex]}</div>

          <div className="form-group">
            <label className="form-label">Choose one option</label>
            <div className="option-grid">
              {options.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={buttonVariants({
                    variant: currentAnswer === option ? "default" : "outline",
                    className: currentAnswer === option ? "option-active" : "option-inactive",
                  })}
                  onClick={() => handleAnswerChange(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {answers.map((answer, index) => (
            <input
              key={index}
              type="hidden"
              name={`question_${index + 1}`}
              value={answer}
            />
          ))}

          <div className="wizard-actions" style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <button
              type="button"
              className={buttonVariants({ variant: "outline" })}
              onClick={goBack}
              disabled={currentIndex === 0}
            >
              Back
            </button>
            {currentIndex < questions.length - 1 ? (
              <button type="button" className={buttonVariants({ className: "btn-next" })} onClick={goNext}>
                Next Question
              </button>
            ) : (
              <button type="submit" className={buttonVariants({ className: "btn-next" })}>
                Submit Assessment
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import React, { useState } from "react";
import { Button } from "./Button";
import { Input } from "./Input";

interface Criterion {
  id: string;
  name: string;
  description: string;
  maxScore: number;
  weight: number;
  order: number;
}

interface Grade {
  criterionId: string;
  score: number;
  comments: string;
}

interface Application {
  id: string;
  firstName: string;
  lastName: string;
  // Add other application fields as needed
}

interface DynamicGradingProps {
  rubric: {
    id: string;
    name: string;
    description: string;
    criteria: Criterion[];
  };
  application: Application;
  existingGrades?: Grade[];
  onSubmit: (grades: Grade[], totalScore: number, comments: string) => void;
  onSave?: (grades: Grade[], totalScore: number, comments: string) => void;
  readOnly?: boolean;
}

export const DynamicGrading: React.FC<DynamicGradingProps> = ({
  rubric,
  application,
  existingGrades = [],
  onSubmit,
  onSave,
  readOnly = false,
}) => {
  const [grades, setGrades] = useState<Grade[]>(
    existingGrades.length > 0
      ? existingGrades
      : rubric.criteria.map((criterion) => ({
          criterionId: criterion.id,
          score: 0,
          comments: "",
        })),
  );

  const [overallComments, setOverallComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateGrade = (criterionId: string, updates: Partial<Grade>) => {
    setGrades((prev) =>
      prev.map((grade) =>
        grade.criterionId === criterionId ? { ...grade, ...updates } : grade,
      ),
    );
  };

  const calculateTotalScore = (): number => {
    return grades.reduce((total, grade) => {
      const criterion = rubric.criteria.find((c) => c.id === grade.criterionId);
      if (criterion) {
        return total + grade.score * criterion.weight;
      }
      return total;
    }, 0);
  };

  const calculateMaxScore = (): number => {
    return rubric.criteria.reduce((total, criterion) => {
      return total + criterion.maxScore * criterion.weight;
    }, 0);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const totalScore = calculateTotalScore();
      await onSubmit(grades, totalScore, overallComments);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = async () => {
    if (isSubmitting || !onSave) return;
    setIsSubmitting(true);

    try {
      const totalScore = calculateTotalScore();
      await onSave(grades, totalScore, overallComments);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {rubric.name}
        </h2>
        {rubric.description && (
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {rubric.description}
          </p>
        )}
      </div>

      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
        <p className="text-blue-800 dark:text-blue-200">
          <strong>Applicant:</strong> {application.firstName}{" "}
          {application.lastName}
        </p>
        <p className="text-blue-800 dark:text-blue-200">
          <strong>Total Score:</strong> {calculateTotalScore().toFixed(1)} /{" "}
          {calculateMaxScore().toFixed(1)}
        </p>
      </div>

      <div className="space-y-6">
        {rubric.criteria
          .sort((a, b) => a.order - b.order)
          .map((criterion) => {
            const grade = grades.find((g) => g.criterionId === criterion.id);
            const percentage = grade
              ? (grade.score / criterion.maxScore) * 100
              : 0;

            return (
              <div
                key={criterion.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {criterion.name}
                    </h3>
                    {criterion.description && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                        {criterion.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {grade?.score.toFixed(1) || "0.0"}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {" "}
                      / {criterion.maxScore}
                    </span>
                  </div>
                </div>

                {/* Score Slider */}
                <div className="mb-3">
                  <input
                    type="range"
                    min="0"
                    max={criterion.maxScore}
                    step="0.5"
                    value={grade?.score || 0}
                    onChange={(e) =>
                      updateGrade(criterion.id, {
                        score: parseFloat(e.target.value),
                      })
                    }
                    disabled={readOnly}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>0</span>
                    <span>{criterion.maxScore}</span>
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="mb-3">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        percentage >= 80
                          ? "bg-green-500"
                          : percentage >= 60
                            ? "bg-yellow-500"
                            : percentage >= 40
                              ? "bg-orange-500"
                              : "bg-red-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* Comments */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Comments for {criterion.name}
                  </label>
                  <textarea
                    value={grade?.comments || ""}
                    onChange={(e) =>
                      updateGrade(criterion.id, { comments: e.target.value })
                    }
                    disabled={readOnly}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Add your comments here..."
                  />
                </div>

                {criterion.weight !== 1 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Weight: {criterion.weight}x
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Overall Comments */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Overall Comments
        </label>
        <textarea
          value={overallComments}
          onChange={(e) => setOverallComments(e.target.value)}
          disabled={readOnly}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Add overall comments about this application..."
        />
      </div>

      {/* Action Buttons */}
      {!readOnly && (
        <div className="mt-6 flex gap-4">
          {onSave && (
            <Button
              onClick={handleSave}
              disabled={isSubmitting}
              variant="secondary"
              className="flex-1"
            >
              {isSubmitting ? "Saving..." : "Save Draft"}
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "Submitting..." : "Submit Grade"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default DynamicGrading;

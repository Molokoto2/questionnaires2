import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface Question {
  id: string;
  questionText: string;
  options: { id: string; text: string }[];
}

const CreateSurvey = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: uuidv4(),
        questionText: '',
        options: [{ id: uuidv4(), text: '' }],
      },
    ]);
  };

  const addOption = (questionId: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? { ...q, options: [...q.options, { id: uuidv4(), text: '' }] }
          : q
      )
    );
  };

  const updateQuestionText = (questionId: string, text: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId ? { ...q, questionText: text } : q
      )
    );
  };

  const updateOptionText = (questionId: string, optionId: string, text: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((o) =>
                o.id === optionId ? { ...o, text } : o
              ),
            }
          : q
      )
    );
  };

  const removeQuestion = (questionId: string) => {
    setQuestions(questions.filter((q) => q.id !== questionId));
  };

  const removeOption = (questionId: string, optionId: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? { ...q, options: q.options.filter((o) => o.id !== optionId) }
          : q
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: survey, error: surveyError } = await supabase
        .from('surveys')
        .insert([{ title, description }])
        .select()
        .single();

      if (surveyError) throw surveyError;

      for (const [index, question] of questions.entries()) {
        const { error: questionError } = await supabase
          .from('questions')
          .insert([
            {
              survey_id: survey.id,
              question_text: question.questionText,
              order: index,
            },
          ])
          .select()
          .single();

        if (questionError) throw questionError;

        for (const [optionIndex, option] of question.options.entries()) {
          const { error: optionError } = await supabase
            .from('options')
            .insert([
              {
                question_id: question.id,
                option_text: option.text,
                order: optionIndex,
              },
            ]);

          if (optionError) throw optionError;
        }
      }

      navigate('/');
    } catch (error) {
      console.error('Error creating survey:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Create New Survey</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Survey Title"
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Survey Description"
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
            rows={3}
          />
        </div>

        <div className="space-y-6">
          {questions.map((question, qIndex) => (
            <div
              key={question.id}
              className="p-6 bg-white rounded-lg shadow-sm space-y-4"
            >
              <div className="flex items-center space-x-4">
                <span className="text-lg font-medium">Question {qIndex + 1}</span>
                <button
                  type="button"
                  onClick={() => removeQuestion(question.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
              <input
                type="text"
                value={question.questionText}
                onChange={(e) => updateQuestionText(question.id, e.target.value)}
                placeholder="Enter your question"
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                required
              />
              <div className="space-y-2">
                {question.options.map((option, oIndex) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) =>
                        updateOptionText(question.id, option.id, e.target.value)
                      }
                      placeholder={`Option ${oIndex + 1}`}
                      className="flex-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                    {question.options.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOption(question.id, option.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addOption(question.id)}
                  className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Option</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={addQuestion}
            className="flex items-center space-x-2 px-4 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50"
          >
            <Plus className="h-5 w-5" />
            <span>Add Question</span>
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <Save className="h-5 w-5" />
            <span>Save Survey</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSurvey;
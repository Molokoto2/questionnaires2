import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface Question {
  id: string;
  question_text: string;
  options: {
    id: string;
    option_text: string;
  }[];
}

interface Survey {
  id: string;
  title: string;
  description: string;
}

const TakeSurvey = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSurvey();
    }
  }, [id]);

  const fetchSurvey = async () => {
    try {
      const { data: surveyData, error: surveyError } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', id)
        .single();

      if (surveyError) throw surveyError;
      setSurvey(surveyData);

      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select(`
          id,
          question_text,
          options (
            id,
            option_text
          )
        `)
        .eq('survey_id', id)
        .order('order');

      if (questionsError) throw questionsError;
      setQuestions(questionsData || []);
    } catch (error) {
      console.error('Error fetching survey:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const respondentId = uuidv4();

      const { data: response, error: responseError } = await supabase
        .from('responses')
        .insert([
          {
            survey_id: id,
            respondent_id: respondentId,
          },
        ])
        .select()
        .single();

      if (responseError) throw responseError;

      const answersToInsert = Object.entries(answers).map(
        ([questionId, optionId]) => ({
          response_id: response.id,
          question_id: questionId,
          option_id: optionId,
        })
      );

      const { error: answersError } = await supabase
        .from('answers')
        .insert(answersToInsert);

      if (answersError) throw answersError;

      navigate(`/survey/${id}/thank-you`);
    } catch (error) {
      console.error('Error submitting survey:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Survey not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold mb-4">{survey.title} </h1>
        {survey.description && (
          <p className="text-gray-600 mb-8">{survey.description}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {questions.map((question, index) => (
            <div key={question.id} className="space-y-4">
              <h3 className="text-lg font-medium">
                {index + 1}. {question.question_text}
              </h3>
              <div className="space-y-2">
                {question.options.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={option.id}
                      onChange={(e) =>
                        setAnswers({ ...answers, [question.id]: e.target.value })
                      }
                      required
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-gray-700">{option.option_text}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Response'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TakeSurvey;
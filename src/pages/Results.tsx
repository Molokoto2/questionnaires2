import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabase';

interface SurveyResult {
  question_text: string;
  options: {
    option_text: string;
    count: number;
  }[];
  total_responses: number;
}

const Results = () => {
  const { id } = useParams<{ id: string }>();
  const [results, setResults] = useState<SurveyResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchResults();
    }
  }, [id]);

  const fetchResults = async () => {
    try {
      const { data: questions, error: questionsError } = await supabase
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

      const resultsData: SurveyResult[] = [];

      for (const question of questions || []) {
        const optionCounts = await Promise.all(
          question.options.map(async (option) => {
            const { count } = await supabase
              .from('answers')
              .select('*', { count: 'exact' })
              .eq('question_id', question.id)
              .eq('option_id', option.id);

            return {
              option_text: option.option_text,
              count: count || 0,
            };
          })
        );

        const totalResponses = optionCounts.reduce(
          (sum, option) => sum + option.count,
          0
        );

        resultsData.push({
          question_text: question.question_text,
          options: optionCounts,
          total_responses: totalResponses,
        });
      }

      setResults(resultsData);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Survey Results</h1>

      {results.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No responses yet.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {results.map((result, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm p-6 space-y-6"
            >
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  {result.question_text}
                </h2>
                <p className="text-gray-600">
                  Total responses: {result.total_responses}
                </p>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={result.options}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="option_text"
                      tick={{ fontSize: 12 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="count"
                      name="Responses"
                      fill="#4f46e5"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2">
                {result.options.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    className="flex justify-between items-center"
                  >
                    <span className="text-gray-700">{option.option_text}</span>
                    <div className="text-right">
                      <span className="font-medium">{option.count}</span>
                      <span className="text-gray-500 ml-2">
                        (
                        {result.total_responses > 0
                          ? Math.round(
                              (option.count / result.total_responses) * 100
                            )
                          : 0}
                        %)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Results;
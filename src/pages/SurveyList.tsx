import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, BarChart3, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Survey {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

const SurveyList = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSurveys(data || []);
    } catch (error) {
      console.error('Error fetching surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSurvey = async (id: string) => {
    try {
      const { error } = await supabase
        .from('surveys')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSurveys(surveys.filter((s) => s.id !== id));
    } catch (error) {
      console.error('Error deleting survey:', error);
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Surveys</h1>
        <Link
          to="/create"
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Create New Survey
        </Link>
      </div>

      {surveys.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No surveys created yet.</p>
          <Link
            to="/create"
            className="mt-4 inline-block text-indigo-600 hover:text-indigo-700"
          >
            Create your first survey
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {surveys.map((survey) => (
            <div
              key={survey.id}
              className="bg-white rounded-lg shadow-sm p-6 space-y-4"
            >
              <h2 className="text-xl font-semibold">{survey.title}</h2>
              <p className="text-gray-600">{survey.description}</p>
              <div className="pt-4 flex items-center justify-between">
                <div className="space-x-2">
                  <Link
                    to={`/survey/${survey.id}`}
                    className="inline-flex items-center space-x-1 text-indigo-600 hover:text-indigo-700"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Share</span>
                  </Link>
                  <Link
                    to={`/results/${survey.id}`}
                    className="inline-flex items-center space-x-1 text-green-600 hover:text-green-700"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Results</span>
                  </Link>
                </div>
                <button
                  onClick={() => deleteSurvey(survey.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SurveyList;
/*
  # Initial Survey System Schema

  1. New Tables
    - `surveys`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `created_at` (timestamp)
      - `user_id` (uuid, references auth.users)
      
    - `questions`
      - `id` (uuid, primary key)
      - `survey_id` (uuid, references surveys)
      - `question_text` (text)
      - `order` (integer)
      
    - `options`
      - `id` (uuid, primary key)
      - `question_id` (uuid, references questions)
      - `option_text` (text)
      - `order` (integer)
      
    - `responses`
      - `id` (uuid, primary key)
      - `survey_id` (uuid, references surveys)
      - `respondent_id` (uuid)
      - `created_at` (timestamp)
      
    - `answer`
      - `id` (uuid, primary key)
      - `response_id` (uuid, references responses)
      - `question_id` (uuid, references questions)
      - `option_id` (uuid, references options)
      
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create surveys table
CREATE TABLE surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users NOT NULL
);

-- Create questions table
CREATE TABLE questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid REFERENCES surveys ON DELETE CASCADE NOT NULL,
  question_text text NOT NULL,
  "order" integer NOT NULL
);

-- Create options table
CREATE TABLE options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES questions ON DELETE CASCADE NOT NULL,
  option_text text NOT NULL,
  "order" integer NOT NULL
);

-- Create responses table
CREATE TABLE responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid REFERENCES surveys ON DELETE CASCADE NOT NULL,
  respondent_id uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create answers table
CREATE TABLE answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id uuid REFERENCES responses ON DELETE CASCADE NOT NULL,
  question_id uuid REFERENCES questions ON DELETE CASCADE NOT NULL,
  option_id uuid REFERENCES options ON DELETE CASCADE NOT NULL
);

-- Enable RLS
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Policies for surveys
CREATE POLICY "Users can create their own surveys"
  ON surveys FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own surveys"
  ON surveys FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own surveys"
  ON surveys FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Policies for questions
CREATE POLICY "Users can manage questions for their surveys"
  ON questions FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM surveys 
    WHERE surveys.id = questions.survey_id 
    AND surveys.user_id = auth.uid()
  ));

-- Policies for options
CREATE POLICY "Users can manage options for their surveys"
  ON options FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM questions 
    JOIN surveys ON surveys.id = questions.survey_id
    WHERE questions.id = options.question_id 
    AND surveys.user_id = auth.uid()
  ));

-- Policies for responses (allow public access for survey responses)
CREATE POLICY "Anyone can submit responses"
  ON responses FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Survey owners can view responses"
  ON responses FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM surveys 
    WHERE surveys.id = responses.survey_id 
    AND surveys.user_id = auth.uid()
  ));

-- Policies for answers
CREATE POLICY "Anyone can submit answers"
  ON answers FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Survey owners can view answers"
  ON answers FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM responses 
    JOIN surveys ON surveys.id = responses.survey_id
    WHERE responses.id = answers.response_id 
    AND surveys.user_id = auth.uid()
  ));
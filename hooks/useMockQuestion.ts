import { AlarmTheme, DifficultyLevel, Question } from "@/constants/types";

const MOCK_QUESTIONS = {
  Math: {
    Easy: [
      { question: "What is 5 + 7?", correctAnswer: "12" },
      { question: "What is 10 - 3?", correctAnswer: "7" },
      { question: "What is 4 × 5?", correctAnswer: "20" },
      { question: "What is 15 ÷ 3?", correctAnswer: "5" },
      { question: "What is 8 + 9?", correctAnswer: "17" },
    ],
    Medium: [
      { question: "What is 17 × 8?", correctAnswer: "136" },
      { question: "What is 144 ÷ 12?", correctAnswer: "12" },
      { question: "What is 25 × 6?", correctAnswer: "150" },
      { question: "What is 89 - 37?", correctAnswer: "52" },
      { question: "What is 15² (15 squared)?", correctAnswer: "225" },
    ],
    Hard: [
      { question: "What is 347 × 23?", correctAnswer: "7981" },
      { question: "What is the square root of 484?", correctAnswer: "22" },
      { question: "What is 1728 ÷ 24?", correctAnswer: "72" },
      { question: "What is 18³ (18 cubed)?", correctAnswer: "5832" },
      { question: "What is 567 + 789 - 321?", correctAnswer: "1035" },
    ],
  },
  Logic: {
    Easy: [
      {
        question: "If today is Monday, what day is it after 2 days?",
        correctAnswer: "Wednesday",
      },
      {
        question: "Complete the pattern: 2, 4, 6, 8, __?",
        correctAnswer: "10",
      },
      { question: "How many months have 31 days?", correctAnswer: "7" },
      {
        question: "A duck is to water as a bird is to __?",
        correctAnswer: "air",
      },
      {
        question: "If you have 3 apples and get 2 more, how many do you have?",
        correctAnswer: "5",
      },
    ],
    Medium: [
      {
        question:
          "If all cats are mammals and some mammals are black, can some cats be black? (yes/no)",
        correctAnswer: "yes",
      },
      {
        question: "Complete: 1, 1, 2, 3, 5, 8, __? (Fibonacci)",
        correctAnswer: "13",
      },
      { question: "How many sides does an octagon have?", correctAnswer: "8" },
      {
        question:
          "If 5 workers take 5 days to build 5 houses, how many days for 1 worker to build 1 house?",
        correctAnswer: "5",
      },
      {
        question: "What comes next: J, F, M, A, M, J, __? (months)",
        correctAnswer: "J",
      },
    ],
    Hard: [
      {
        question:
          "A bat and ball cost $1.10. The bat costs $1 more than the ball. How much is the ball in cents?",
        correctAnswer: "5",
      },
      {
        question:
          "If 2 typists type 2 pages in 2 minutes, how many pages can 10 typists type in 10 minutes?",
        correctAnswer: "50",
      },
      {
        question: "What is the next prime number after 97?",
        correctAnswer: "101",
      },
      {
        question: "How many triangles are in a pentagram (5-pointed star)?",
        correctAnswer: "10",
      },
      {
        question: "Complete: 1, 4, 9, 16, 25, __? (perfect squares)",
        correctAnswer: "36",
      },
    ],
  },
  Chinese: {
    Easy: [
      {
        question: 'Translate "Good Morning" to Pinyin',
        correctAnswer: "zao shang hao",
      },
      { question: 'Translate "Thank You" to Pinyin', correctAnswer: "xie xie" },
      { question: 'What is "Hello" in Pinyin?', correctAnswer: "ni hao" },
      { question: 'Translate "Goodbye" to Pinyin', correctAnswer: "zai jian" },
      { question: 'What number is "san" (三)?', correctAnswer: "3" },
    ],
    Medium: [
      {
        question: 'Translate "I love you" to Pinyin',
        correctAnswer: "wo ai ni",
      },
      {
        question: 'What does "xing qi yi" (星期一) mean in English?',
        correctAnswer: "Monday",
      },
      {
        question: 'Translate "How much?" to Pinyin',
        correctAnswer: "duo shao qian",
      },
      { question: 'What is "teacher" in Pinyin?', correctAnswer: "lao shi" },
      {
        question: 'Translate "restaurant" to Pinyin',
        correctAnswer: "can ting",
      },
    ],
    Hard: [
      {
        question:
          'What does "yi yan ji chu si ma nan zhui" (一言既出驷马难追) mean?',
        correctAnswer: "A word spoken cannot be taken back",
      },
      { question: 'Translate "diligence" to Pinyin', correctAnswer: "qin fen" },
      {
        question: 'What does "dui niu tan qin" (对牛弹琴) literally mean?',
        correctAnswer: "Playing music to a cow",
      },
      {
        question: 'What is "perseverance" in Pinyin?',
        correctAnswer: "jian chi",
      },
      {
        question: 'Translate "opportunity" to Pinyin',
        correctAnswer: "ji hui",
      },
    ],
  },
  English: {
    Easy: [
      {
        question:
          'Choose the synonym of "Happy": (A) Sad (B) Joyful (C) Angry. Type A, B, or C',
        correctAnswer: "B",
      },
      { question: 'Spell the opposite of "hot"', correctAnswer: "cold" },
      { question: 'What is the plural of "child"?', correctAnswer: "children" },
      {
        question:
          'Choose the synonym of "Big": (A) Small (B) Large (C) Tiny. Type A, B, or C',
        correctAnswer: "B",
      },
      { question: 'Spell the past tense of "run"', correctAnswer: "ran" },
    ],
    Medium: [
      {
        question:
          'Choose the synonym of "Rapid": (A) Slow (B) Fast (C) Lazy. Type A, B, or C',
        correctAnswer: "B",
      },
      {
        question: 'What word means "to make less severe"?',
        correctAnswer: "alleviate",
      },
      {
        question: 'Spell the adjective form of "beauty"',
        correctAnswer: "beautiful",
      },
      {
        question:
          'Choose the synonym of "Eternal": (A) Temporary (B) Lasting (C) Brief. Type A, B, or C',
        correctAnswer: "B",
      },
      {
        question: 'What is the opposite of "abundant"?',
        correctAnswer: "scarce",
      },
    ],
    Hard: [
      {
        question:
          'Choose the synonym of "Ephemeral": (A) Permanent (B) Fleeting (C) Eternal. Type A, B, or C',
        correctAnswer: "B",
      },
      {
        question: 'What word means "existing in name only"?',
        correctAnswer: "nominal",
      },
      {
        question: 'Spell a word meaning "using very few words"',
        correctAnswer: "succinct",
      },
      {
        question:
          'Choose the synonym of "Ubiquitous": (A) Rare (B) Everywhere (C) Hidden. Type A, B, or C',
        correctAnswer: "B",
      },
      {
        question: 'What word means "to make worse or more severe"?',
        correctAnswer: "exacerbate",
      },
    ],
  },
};

export const useMockQuestion = () => {
  const generateQuestion = (
    theme: AlarmTheme,
    difficulty: DifficultyLevel,
  ): Question => {
    const questions = MOCK_QUESTIONS[theme][difficulty];
    const randomIndex = Math.floor(Math.random() * questions.length);
    const selectedQuestion = questions[randomIndex];

    return {
      question: selectedQuestion.question,
      correctAnswer: selectedQuestion.correctAnswer,
      theme,
      difficulty,
    };
  };

  const checkAnswer = (userAnswer: string, correctAnswer: string): boolean => {
    // Normalize answers: trim whitespace, lowercase
    const normalizedUser = userAnswer.trim().toLowerCase();
    const normalizedCorrect = correctAnswer.trim().toLowerCase();

    return normalizedUser === normalizedCorrect;
  };

  return {
    generateQuestion,
    checkAnswer,
  };
};

export type AlarmTheme = "Math" | "Logic" | "Chinese" | "English";

export type DifficultyLevel = "Easy" | "Medium" | "Hard";

export type AlarmMode = "Snooze" | "Dismiss";

export interface Alarm {
  id: string;
  time: Date;
  enabled: boolean;
  repeatDays: number[]; // 0-6 (Sunday-Saturday)
  theme: AlarmTheme;
  difficulty: DifficultyLevel;
  mode: AlarmMode;
  label?: string;
}

export interface Question {
  question: string;
  correctAnswer: string;
  theme: AlarmTheme;
  difficulty: DifficultyLevel;
}

export interface GameSession {
  userId: string;
  score: number;
  round: number;
  correctAnswer: number;
  expiresAt: number;
}

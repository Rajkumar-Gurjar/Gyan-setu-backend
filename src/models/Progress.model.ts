import { Schema, model, Document, Types } from 'mongoose';

export interface IQuizAttempt {
  quizId: Types.ObjectId;
  attemptNumber: number;
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  answers: Array<{
    questionId: Types.ObjectId;
    selectedOption?: Types.ObjectId;
    answer?: string;
    isCorrect: boolean;
    points: number;
  }>;
  startedAt?: Date;
  submittedAt: Date;
  duration?: number; // seconds
}

export interface IProgress extends Document {
  userId: Types.ObjectId;
  lessonId: Types.ObjectId;
  status: 'not_started' | 'in_progress' | 'completed';
  watchTime: number; // total seconds watched
  lastWatchedPosition: number; // video timestamp
  completedAt?: Date;
  quizAttempts: IQuizAttempt[];
  bestQuizScore: number;
  notes?: string;
  bookmarks: Array<{
    timestamp: number;
    note?: string;
    createdAt: Date;
  }>;
  rating?: number;
  review?: string;
  syncStatus: 'synced' | 'pending' | 'conflict';
  lastSyncedAt: Date;
  clientTimestamp?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const QuizAttemptSchema = new Schema<IQuizAttempt>({
  quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  attemptNumber: { type: Number, required: true },
  score: { type: Number, required: true },
  totalPoints: { type: Number, required: true },
  percentage: { type: Number, required: true },
  passed: { type: Boolean, required: true },
  answers: [{
    questionId: { type: Schema.Types.ObjectId, required: true },
    selectedOption: { type: Schema.Types.ObjectId },
    answer: { type: String },
    isCorrect: { type: Boolean, required: true },
    points: { type: Number, required: true }
  }],
  startedAt: { type: Date },
  submittedAt: { type: Date, required: true },
  duration: { type: Number }
}, { _id: false });

const ProgressSchema = new Schema<IProgress>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started'
  },
  watchTime: { type: Number, default: 0 },
  lastWatchedPosition: { type: Number, default: 0 },
  completedAt: { type: Date },
  quizAttempts: [QuizAttemptSchema],
  bestQuizScore: { type: Number, default: 0 },
  notes: { type: String },
  bookmarks: [{
    timestamp: { type: Number, required: true },
    note: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  rating: { type: Number, min: 1, max: 5 },
  review: { type: String },
  syncStatus: {
    type: String,
    enum: ['synced', 'pending', 'conflict'],
    default: 'synced'
  },
  lastSyncedAt: { type: Date, default: Date.now },
  clientTimestamp: { type: Date }
}, { timestamps: true });

// Ensure unique progress per user and lesson
ProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

export const ProgressModel = model<IProgress>('Progress', ProgressSchema);

import { Schema, model, Document, Model, Types } from 'mongoose';

// Interface for the multilingual fields
interface IMultilingual {
    pa?: string;
    hi?: string;
    en: string;
}

// Interface for Question Options
interface IOption extends Document {
    text: IMultilingual;
    imageKey?: string;
    isCorrect: boolean;
}

// Interface for Quiz Questions
interface IQuestion extends Document {
    type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'image_choice';
    question: IMultilingual;
    imageKey?: string;
    options: IOption[];
    correctAnswer?: IMultilingual;
    explanation?: IMultilingual;
    points: number;
    order: number;
}

// Interface for Quiz Analytics
interface IQuizAnalytics {
    attempts: number;
    avgScore: number;
    passRate: number;
}

// Interface for the main Quiz document
export interface IQuiz extends Document {
    title: IMultilingual;
    description?: IMultilingual;
    lessonId?: Types.ObjectId;
    subject: string;
    class: number;
    type: 'practice' | 'assessment' | 'certification';
    timeLimit?: number;
    passingScore: number;
    attemptsAllowed: number;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    showCorrectAnswers: boolean;
    showScoreImmediately: boolean;
    questions: IQuestion[];
    totalPoints: number;
    createdBy: Types.ObjectId;
    isPublished: boolean;
    publishedAt?: Date;
    analytics: IQuizAnalytics;
    isActive: boolean;
    isDeleted: boolean;
}

// Mongoose Schema definitions

const MultilingualSchema = new Schema<IMultilingual>({
    pa: { type: String },
    hi: { type: String },
    en: { type: String, required: true },
}, { _id: false });

const OptionSchema = new Schema<IOption>({
    text: { type: MultilingualSchema, required: true },
    imageKey: { type: String },
    isCorrect: { type: Boolean, required: true },
});

const QuestionSchema = new Schema<IQuestion>({
    type: { type: String, enum: ['multiple_choice', 'true_false', 'fill_blank', 'image_choice'], required: true },
    question: { type: MultilingualSchema, required: true },
    imageKey: { type: String },
    options: [OptionSchema],
    correctAnswer: { type: MultilingualSchema },
    explanation: { type: MultilingualSchema },
    points: { type: Number, default: 1 },
    order: { type: Number },
});

const QuizAnalyticsSchema = new Schema<IQuizAnalytics>({
    attempts: { type: Number, default: 0 },
    avgScore: { type: Number, default: 0 },
    passRate: { type: Number, default: 0 },
}, { _id: false });

const QuizSchema = new Schema<IQuiz>({
    title: { type: MultilingualSchema, required: true },
    description: { type: MultilingualSchema },
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson' },
    subject: { type: String, required: true },
    class: { type: Number, required: true },
    type: { type: String, enum: ['practice', 'assessment', 'certification'], default: 'practice' },
    timeLimit: { type: Number },
    passingScore: { type: Number, default: 60 },
    attemptsAllowed: { type: Number, default: -1 },
    shuffleQuestions: { type: Boolean, default: false },
    shuffleOptions: { type: Boolean, default: true },
    showCorrectAnswers: { type: Boolean, default: true },
    showScoreImmediately: { type: Boolean, default: true },
    questions: [QuestionSchema],
    totalPoints: { type: Number, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    analytics: { type: QuizAnalyticsSchema, default: {} },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });


export const QuizModel: Model<IQuiz> = model<IQuiz>('Quiz', QuizSchema);

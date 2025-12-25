import mongoose, { Schema, Document, Model } from 'mongoose';

// 1. Interface defining the shape of the data
export interface ILesson extends Document {
    lessonId: string;       // Mapped from "id": "lesson-001"
    title: string;          // "Introduction to Mathematics"
    subject: string;        // "Mathematics"
    grade: number;          // 10
    duration: number;       // 45 (minutes)
    description: string;    // "Basic concepts..."
    instructor: string;     // "Dr. Sharma"
    content?: {
        type: string;
        videoKey?: string;
        videoDuration?: number;
        body?: Record<string, string>;
    };
    tags?: string[];
    createdAt: Date;        // "2025-01-15..."
    updatedAt: Date;
}

// 2. Mongoose Schema defining structure and validation
const lessonSchema = new Schema<ILesson>({
    lessonId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    title: {
        type: String,
        required: [true, 'Lesson title is required'],
        trim: true
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true
    },
    grade: {
        type: Number,
        required: [true, 'Grade level is required'],
        min: 1,
        max: 12
    },
    duration: {
        type: Number,
        required: [true, 'Duration is required'],
        min: 0
    },
    description: {
        type: String,
        trim: true
    },
    instructor: {
        type: String,
        required: [true, 'Instructor name is required'],
        trim: true
    },
    content: new Schema({
        type: {
            type: String,
            required: true
        },
        videoKey: String,
        videoDuration: Number,
        body: Schema.Types.Mixed
    }, { _id: false }),
    tags: [String]
}, {
    // This automatically manages 'createdAt' and 'updatedAt'
    timestamps: true
});

// 3. Export the Model
export const LessonModel: Model<ILesson> = mongoose.model<ILesson>('Lesson', lessonSchema);
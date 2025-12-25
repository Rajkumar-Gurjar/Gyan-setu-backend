import express from 'express';
import mainRouter from './routes'; // Import the main router
import { connectDB } from './config/database'; // Import the connectDB function

const app = express();

app.use(express.json());


const port = process.env.PORT ;

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.use('/api/v1', mainRouter); // Mount the main router

const startServer = async () => {
    try {
        await connectDB();
        app.listen(port, () => {
            console.log(`server started on port: http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

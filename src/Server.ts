import express from 'express';
import http from 'http';
import mainRouter from './routes'; // Import the main router
import { connectDB, disconnectDB } from './config/database'; // Import the connectDB and disconnectDB functions
import { setupSwagger } from './config/swagger.config';

const app = express();

app.use(express.json());

// Swagger Documentation
setupSwagger(app);

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.use('/api/v1', mainRouter); // Mount the main router

let server: http.Server;

const startServer = async (dbUri?: string, portOverride?: number) => {
    try {
        await connectDB(dbUri);
        const port = portOverride !== undefined ? portOverride : (process.env.PORT || 3000);
        server = app.listen(port, () => {
            if (portOverride !== 0) { // Don't log for random port
                console.log(`server started on port: http://localhost:${port}`);
            }
        });
        return server;
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

const closeServer = async () => {
    await disconnectDB();
    return new Promise<void>((resolve, reject) => {
        if (server) {
            server.close((err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        } else {
            resolve();
        }
    });
};

if (require.main === module) {
    startServer();
}

export { app, startServer, closeServer };

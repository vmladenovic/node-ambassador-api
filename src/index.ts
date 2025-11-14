import "reflect-metadata";
import express, {Request, Response} from 'express';
import cors from 'cors'
import {DataSource} from "typeorm";
import {routes} from "./routes.ts";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import {createClient} from "redis";

dotenv.config();
export const client = createClient({
    url: process.env.REDIS_URL,
});

export const AppDataSource = new DataSource({
    "type": "mysql",
    "host": process.env.DB_HOST,
    "port": parseInt(process.env.DB_PORT ?? '3306'),
    "username": process.env.DB_USER,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_NAME,
    "synchronize": true,
    "logging": false,
    "entities": ["src/entity/*.ts"]
});

AppDataSource
    .initialize()
    .then(async () => {
        await  client.connect();
        const app = express();

        app.use(cookieParser());
        app.use(express.json());
        app.use(cors({
            origin: ['http://localhost:3000', 'http://localhost:4000', 'http://localhost:5000'],
            credentials: true, // Crucial: Allow sending and receiving cookies/credentials
        }));

        routes(app);

        app.get('/', (req: Request, res: Response) => {
            res.send('Hello World!');
        });

        app.listen(8000, () => {
            console.log("Server started on port 8000");
        });
    })
    .catch(error => console.log(error));
import express, { Request, Response } from 'express';
import router from './routes/api';
import dotenv from 'dotenv';

const cors = require('cors');

dotenv.config();

const app = express();
const port = process.env.SERVERPORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/api', router)


app.get('/', (req: Request, res: Response) => {
    res.send(`Express + Typescript Server`);
})

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
})
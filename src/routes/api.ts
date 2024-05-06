import { NextFunction, Request, Response, Router } from "express";

import connection from "../db/db";

const router = Router();

const timelog = (req: Request, res: Response, next: NextFunction) => {
    console.log(`Time: `, Date.now());
    next();
}

router.use(timelog);

router.get('/', (req: Request, res: Response) => {
    res.send('wow this worked');
})

router.post('/create-account', (req: Request, res: Response) => {
    console.log("TEST");
    console.log(req.body);
})

export default router;
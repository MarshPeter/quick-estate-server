import { NextFunction, Request, Response, Router } from "express";

import connection from "../db/db";
import { createAccount } from "../db/actions/CreateAccount";

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
    console.log(req.body);
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    let phone = null;
    if (req.body.phone) {
        phone = req.body.phone;
    }
    console.log(phone);
    const displayName = req.body.displayName;
    // TODO: ACTUALLY IMPLEMENT HASHING
    const passwordHash = req.body.password;

    // TODO: ACTUALLY IMPLEMENT VALIDATION OF SOME KIND
    const result = createAccount(firstName, lastName, email, phone, displayName, passwordHash);
    if (!result) {
        res.status(200);
    }

    if (!result) {
        res.status(500);
    }
})

export default router;


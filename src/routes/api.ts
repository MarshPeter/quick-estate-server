import { NextFunction, Request, Response, Router } from "express";

import { createAccount } from "../db/actions/CreateAccount";
import { verifyLogin } from "../db/actions/verifyLogin";
import getNewConnection from "../db/db";

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

// currently will only handle displayName to reduce complexity
router.get('/confirm-login/:displayName/:passwordEntered', (req: Request, res: Response) => {
    const displayName = req.params.displayName;
    const enteredPassword = req.params.passwordEntered;

    // TODO: ACTUALLY IMPLEMENT PASSWORD HASHING
    const connection = getNewConnection();
    connection.connect((err: string) => {
        if (err) {
            console.log("COULDN'T CONNECT TO CREATE ACCOUNT: " + err);
            return err;
        }
    })

    const query = `SELECT * FROM account WHERE displayName='${displayName}' AND passwordHash='${enteredPassword}'`;
    
    connection.query(query, (error: any, results: any, fields: any) => {
        if (error) throw error;
        if (results[0]) {
            res.status(200).json({id: results[0].id});
        } else {
            res.status(404).json({err: "couldn't confirm credentials on the server"});
        }
    })
})

export default router;


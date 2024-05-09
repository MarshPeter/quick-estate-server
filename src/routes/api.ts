import { promisify } from "util";

import { NextFunction, Request, Response, Router } from "express";

import { createAccount } from "../db/actions/CreateAccount";
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

router.post('/create-account', async (req: Request, res: Response) => {
    console.log(req.body);
    let unique = true;
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

    let connection = getNewConnection();

    connection.connect((err: string) => {
        if (err) {
            console.log("COULDN'T CONNECT TO CREATE ACCOUNT: " + err);
            return err;
        }
    })

    let queryAsync = promisify(connection.query).bind(connection);

    let query = `SELECT * FROM account WHERE displayName='${displayName}' OR email='${email}'`;

    try {
        const results = await queryAsync(query);
        if  (results.length > 0) {
            unique = false;
            res.status(409).json({err: "That Display Name or Email is already Taken, please try again"});
        }
    } catch (error) {
        console.error('Error executing Query: ', error);
        connection.end();
        return res.status(500).json({err: "There was an error on the server, please contact admin"});
    }

    connection.end();

    if (!unique) {
        return;
    }

    // TODO: ACTUALLY IMPLEMENT VALIDATION OF SOME KIND
     connection = getNewConnection();
    connection.connect((err: string) => {
        if (err) {
            console.log("COULDN'T CONNECT TO CREATE ACCOUNT: " + err);
            return err;
        }
    })

    queryAsync = promisify(connection.query).bind(connection);

    if (phone) {
        query = `INSERT INTO account (firstName, lastName, email, phone, displayName, passwordHash)
        VALUES ('${firstName}', '${lastName}', '${email}', '${phone}', '${displayName}', '${passwordHash}')`
    } else {
        query = `INSERT INTO account (firstName, lastName, email, displayName, passwordHash)
        VALUES ('${firstName}', '${lastName}', '${email}', '${displayName}', '${passwordHash}')`
    }

    try {
        await queryAsync(query);
    } catch(error) {
        console.log("THERE WAS AN ERROR: " + error);
        res.status(500).json({err: "Unable to place your credentials in the database, contact admin"});
    }

    connection.end();

    connection = getNewConnection();

    connection.connect((err: string) => {
        if (err) {
            console.log("COULDN'T CONNECT TO CREATE ACCOUNT: " + err);
            return err;
        }
    })

    queryAsync = promisify(connection.query).bind(connection);
    query = `SELECT * FROM account WHERE displayName='${displayName}' AND passwordHash='${passwordHash}'`;

    try {
        const results = await queryAsync(query);
        if (results.length === 0) {
            console.log(results);
            res.status(500).json({err: "Your account has been added, but you were unable to be logged in, please try login through the header. Alternatively, contact admin"});
        } else {
            res.status(200).json({id: results[0].id});
        }
    } catch (error) {
        console.log("There was a major error: " + error);
            res.status(500).json({err: "Your account has been added, but you were unable to be logged in, please try login through the header. Alternatively, contact admin"});
    }

    connection.end();
})

// currently will only handle displayName to reduce complexity
router.get('/confirm-login/:displayName/:passwordEntered', (req: Request, res: Response) => {
    const displayName = req.params.displayName;
    const enteredPassword = req.params.passwordEntered;

    console.log("CONNECTED", displayName, enteredPassword);

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

    connection.end();
})

export default router;


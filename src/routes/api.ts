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
});

router.post('/add-listing', async (req: Request, res: Response) => {
    console.log(req.body);
    const accountId = req.body.accountId;
    const title = req.body.title;
    const location = req.body.title;
    const auctionDate = req.body.auctionDate;
    const auctioneerName = req.body.auctioneerName;
    const auctioneerLocation = req.body.auctionLocation;
    const reservePrice = req.body.reservePrice;
    const primaryImageUrl = req.body.primaryImageUrl;
    const description = req.body.description;
    const wishlistCount = 0;
    const sold = 0;

    const connection = getNewConnection();
    const queryAsync = promisify(connection.query).bind(connection);

    const query = `INSERT INTO listing (account_id, title, location, auctionDate, auctioneerName, auctionLocation, reservePrice, primaryImageUrl, description, wishlistCount, sold) VALUES(${accountId}, '${title}', '${location}', '${auctionDate}', '${auctioneerName}', '${auctioneerLocation}', '${reservePrice}', '${primaryImageUrl}', '${description}', '${wishlistCount}', '${sold}')`;

    try {
        await queryAsync(query);
    } catch (error) {
        console.log("THERE WAS AN ERROR: ", error);
        res.status(500).json({err: "There was a problem uploading your listing to the database. Please try again"});
        return;
    }

    res.status(200);
});

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

router.get('/get-profile/:id', async (req: Request, res: Response) => {
    const id = req.params.id;

    const connection = getNewConnection();

    connection.connect((err: string) => {
        if (err) {
            console.log("COULDN'T CONNECT TO CREATE ACCOUNT: " + err);
            res.status(500).json({err: "Couldn't connect to the database, contact the administrators"});
            return;
        }
    })

    const queryAsync = promisify(connection.query).bind(connection);
    let query = `SELECT * FROM account WHERE account.id=${id}`;
    let currentResult = [];

    try {
        const result = await queryAsync(query);
        currentResult = result[0];
    } catch (error) {
        console.log(error);
    }

    query = `SELECT * FROM listing WHERE account_id = ${id}`;

    try {
        const result = await queryAsync(query);
        currentResult.listings = result;
    } catch (error) {
        console.log(error);
        res.status(500).json({err: "Couldn't connect to the database, contact the administrators"});
        return;
    }

    console.log(currentResult);
    res.status(200).json(currentResult);

    connection.end();
})

export default router;


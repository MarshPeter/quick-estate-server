import getNewConnection from "../db";

export function createAccount(
    firstName: string,
    lastName: string,
    email: string,
    phone: string | null,
    displayName: string,
    passwordHash: string
    ) {
    const connection = getNewConnection();
    connection.connect((err: string) => {
        if (err) {
            console.log("COULDN'T CONNECT TO CREATE ACCOUNT: " + err);
            return err;
        }
    })

    let query;

    if (phone) {
        query = `INSERT INTO account (firstName, lastName, email, phone, displayName, passwordHash)
        VALUES ('${firstName}', '${lastName}', '${email}', '${phone}', '${displayName}', '${passwordHash}')`
    } else {
        query = `INSERT INTO account (firstName, lastName, email, displayName, passwordHash)
        VALUES ('${firstName}', '${lastName}', '${email}', '${displayName}', '${passwordHash}')`
    }

    connection.query(query, (error:any, results: any, fields: any) => {
        if (error) throw error;
        return "error";
    })

    connection.end();

    return "";
}
import connection from "../db";

function createAccount(
    firstName: string,
    lastName: string,
    email: string,
    phone: string | null,
    displayName: string,
    passwordHash: string
    ) {
    connection.connect((err: string) => {
        console.log("COULDN'T CONNECT TO CREATE ACCOUNT: " + err);
        return;
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
    })
}
const sql = require('mssql');

module.exports = async function (context, req) {
    const config = {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        server: process.env.DB_SERVER, 
        database: process.env.DB_NAME,
        options: {
            encrypt: true, 
            trustServerCertificate: false
        }
    };

    try {
        await sql.connect(config);
        const result = await sql.query`SELECT Id, Tittel, Innhold, BildeUrl, Tidspunkt FROM MesterInnlegg ORDER BY Tidspunkt DESC`;
        
        context.res = {
            status: 200,
            body: result.recordset
        };
    } catch (err) {
        context.log('SQL Error:', err);
        context.res = {
            status: 500,
            body: "Feil ved henting av data fra SQL: " + err.message
        };
    } finally {
        await sql.close();
    }
};
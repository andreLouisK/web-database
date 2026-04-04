const sql = require('mssql');

module.exports = async function (context, req) {
    const config = {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        server: process.env.DB_SERVER,
        database: process.env.DB_NAME,
        options: {
            encrypt: true,
            trustServerCertificate: false,
            connectTimeout: 30000, // 30 sekunder
            requestTimeout: 30000
        }
    };

    try {
        // Vi oppretter en "pool" (en stabil tunnel til databasen)
        let pool = await sql.connect(config);
        let result = await pool.request().query("SELECT Id, Tittel, Innhold, BildeUrl, Tidspunkt FROM MesterInnlegg ORDER BY Tidspunkt DESC");
        
        context.res = {
            status: 200,
            headers: { "Content-Type": "application/json" },
            body: result.recordset
        };
    } catch (err) {
        context.log("SQL Error:", err.message);
        context.res = {
            status: 500,
            body: { error: err.message }
        };
    } finally {
        // Vi lukker ikke poolen med en gang i Functions, 
        // men for nå lar vi den være enkel
        await sql.close();
    }
};
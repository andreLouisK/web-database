const sql = require('mssql');

module.exports = async function (context, req) {
    // Vi henter den samlede strengen fra Azure
    const connectionString = process.env.SqlConnectionString;

    try {
        // Koble til direkte med strengen
        let pool = await sql.connect(connectionString);
        
        let result = await pool.request().query(
            "SELECT Id, Tittel, Innhold, BildeUrl, Tidspunkt FROM MesterInnlegg ORDER BY Tidspunkt DESC"
        );
        
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
        await sql.close();
    }
};
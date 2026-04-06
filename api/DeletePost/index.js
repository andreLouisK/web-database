const sql = require('mssql');

module.exports = async function (context, req) {
    // Henter den samlede strengen
    const connectionString = process.env.SqlConnectionString;

    try {
        const { id } = req.params;

        // Kobler til med strengen direkte
        let pool = await sql.connect(connectionString);
        
        await pool.request()
            .input('id', sql.Int, id)
            .query("DELETE FROM MesterInnlegg WHERE Id = @id");

        context.res = { 
            status: 200, 
            body: "Innlegg slettet!" 
        };
    } catch (error) {
        context.log("Feil ved sletting i SQL:", error.message);
        context.res = { 
            status: 500, 
            body: error.message 
        };
    } finally {
        // Lukker koblingen
        await sql.close();
    }
};
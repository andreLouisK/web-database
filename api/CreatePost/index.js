const sql = require('mssql');

module.exports = async function (context, req) {
    // Vi henter den samlede strengen fra Azure Environment Variables
    const connectionString = process.env.SqlConnectionString;

    try {
        const { Tittel, Innhold, BildeUrl } = req.body;

        if (!Tittel) {
            context.res = { 
                status: 400, 
                body: "Tittel mangler!" 
            };
            return;
        }

        // Koble til direkte ved hjelp av strengen
        let pool = await sql.connect(connectionString);
        
        await pool.request()
            .input('tittel', sql.NVarChar, Tittel)
            .input('innhold', sql.NVarChar, Innhold)
            .input('bilde', sql.NVarChar, BildeUrl || '')
            .query("INSERT INTO MesterInnlegg (Tittel, Innhold, BildeUrl) VALUES (@tittel, @innhold, @bilde)");

        context.res = {
            status: 201,
            body: { message: "Innlegg opprettet!" }
        };
    } catch (err) {
        context.log("SQL Error i CreatePost:", err.message);
        context.res = { 
            status: 500, 
            body: err.message 
        };
    } finally {
        // Viktig å lukke forbindelsen så vi ikke går tom for tilkoblinger
        await sql.close();
    }
};
const sql = require('mssql');

module.exports = async function (context, req) {
    const config = {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        server: process.env.DB_SERVER,
        database: process.env.DB_NAME,
        options: { encrypt: true, trustServerCertificate: false }
    };

    try {
        const { Tittel, Innhold, BildeUrl } = req.body;

        if (!Tittel) {
            context.res = { status: 400, body: "Tittel mangler!" };
            return;
        }

        let pool = await sql.connect(config);
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
        context.res = { status: 500, body: err.message };
    } finally {
        await sql.close();
    }
};
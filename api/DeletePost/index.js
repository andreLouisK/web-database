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
        const { id } = req.params;
        let pool = await sql.connect(config);
        await pool.request().input('id', sql.Int, id).query("DELETE FROM MesterInnlegg WHERE Id = @id");
        context.res = { status: 200, body: "Innlegg slettet!" };
    } catch (error) {
        console.error("Feil ved sletting:", error);
        context.res = { status: 500, body: error.message };
    } finally {
        await sql.close();
    }
};
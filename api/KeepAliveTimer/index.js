const sql = require('mssql');

module.exports = async function (context, myTimer) {
    const connectionString = process.env.SqlConnectionString;

    try {
        // Vi tvinger en tilkobling til SQL
        let pool = await sql.connect(connectionString);
        
        // En "SELECT 1" er verdens letteste spørring, 
        // men nok til å holde databasen våken.
        await pool.request().query("SELECT 1"); 
        
        context.log('SQL Keep-Alive: Database holdes våken.');
    } catch (err) {
        context.log('SQL Keep-Alive feilet (er strengen lagt inn?):', err.message);
    } finally {
        // Viktig å lukke koblingen hver gang
        await sql.close();
    }
};
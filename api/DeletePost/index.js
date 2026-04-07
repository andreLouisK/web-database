const sql = require('mssql');
const { BlobServiceClient } = require('@azure/storage-blob');

module.exports = async function (context, req) {
    const connectionString = process.env.SqlConnectionString;
    const blobConnectionString = process.env.AzureWebJobsStorage;

    try {
        const { id } = req.params;
        
        // Sikre at ID er et gyldig tall før vi starter
        if (!id || isNaN(id)) {
            context.res = { status: 400, body: "Ugyldig ID" };
            return;
        }

        let pool = await sql.connect(connectionString);

        // 1. Finn BildeUrl
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query("SELECT BildeUrl FROM MesterInnlegg WHERE Id = @id");

        if (result.recordset.length > 0) {
            const bildeUrl = result.recordset[0].BildeUrl;

            if (bildeUrl && bildeUrl.includes("blob.core.windows.net")) {
                try {
                    const urlParts = bildeUrl.split('/');
                    let blobName = urlParts[urlParts.length - 1];
                    
                    // VIKTIG: Dekoder navnet (fjerner %20, %2D osv)
                    blobName = decodeURIComponent(blobName);

                    const blobServiceClient = BlobServiceClient.fromConnectionString(blobConnectionString);
                    const containerClient = blobServiceClient.getContainerClient("images");
                    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

                    await blockBlobClient.deleteIfExists();
                    context.log(`Forsøkte sletting av blob: ${blobName}`);
                } catch (blobErr) {
                    context.log("Kunne ikke slette blob-fil, men fortsetter:", blobErr.message);
                }
            }
        }

        // 2. Slett raden fra SQL
        await pool.request()
            .input('id', sql.Int, id)
            .query("DELETE FROM MesterInnlegg WHERE Id = @id");

        context.res = { 
            status: 200, 
            body: "Slettet ok" 
        };
    } catch (error) {
        context.log("Kritisk feil ved sletting:", error.message);
        context.res = { status: 500, body: error.message };
    } finally {
        // Valgfritt: I Azure Functions kan det av og til lønne seg å IKKE lukke
        // poolen hvis man har mye trafikk, men for små prosjekter er dette tryggest.
        await sql.close();
    }
};
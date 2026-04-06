const sql = require('mssql');
const { BlobServiceClient } = require('@azure/storage-blob');

module.exports = async function (context, req) {
    const connectionString = process.env.SqlConnectionString;
    const blobConnectionString = process.env.AzureWebJobsStorage; // Vi bruker samme lagring som før

    try {
        const { id } = req.params;
        let pool = await sql.connect(connectionString);

        // 1. Finn BildeUrl før vi sletter raden
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query("SELECT BildeUrl FROM MesterInnlegg WHERE Id = @id");

        if (result.recordset.length > 0) {
            const bildeUrl = result.recordset[0].BildeUrl;

            // 2. Hvis det finnes en bilde-URL, slett fila fra Blob Storage
            if (bildeUrl && bildeUrl.includes("blob.core.windows.net")) {
                try {
                    // Vi må trekke ut selve filnavnet fra URL-en
                    // URL-format: https://konto.blob.core.windows.net/images/filnavn.jpg
                    const urlParts = bildeUrl.split('/');
                    const blobName = urlParts[urlParts.length - 1];

                    const blobServiceClient = BlobServiceClient.fromConnectionString(blobConnectionString);
                    const containerClient = blobServiceClient.getContainerClient("images");
                    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

                    await blockBlobClient.deleteIfExists();
                    context.log(`Slettet bilde: ${blobName}`);
                } catch (blobErr) {
                    // Vi logger feilen, men stopper ikke sletting av selve posten
                    context.log("Kunne ikke slette blob-fil:", blobErr.message);
                }
            }
        }

        // 3. Slett raden fra SQL
        await pool.request()
            .input('id', sql.Int, id)
            .query("DELETE FROM MesterInnlegg WHERE Id = @id");

        context.res = { 
            status: 200, 
            body: "Innlegg og tilhørende bilde slettet!" 
        };
    } catch (error) {
        context.log("Feil ved sletting:", error.message);
        context.res = { 
            status: 500, 
            body: error.message 
        };
    } finally {
        await sql.close();
    }
};
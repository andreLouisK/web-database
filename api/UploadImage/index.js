const { BlobServiceClient } = require('@azure/storage-blob');
const multipart = require('parse-multipart-data');

module.exports = async function (context, req) {
    try {
        // Vi bruker den samme lagrings-strengen som Azure Functions allerede har!
        const connectionString = process.env.AzureWebJobsStorage;
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient("images"); // Navnet på din blob

        // Les fila fra requesten
        const bodyBuffer = Buffer.from(req.body);
        const boundary = multipart.getBoundary(req.headers['content-type']);
        const parts = multipart.parse(bodyBuffer, boundary);

        if (!parts || parts.length === 0) {
            context.res = { status: 400, body: "Ingen fil funnet i opplastingen." };
            return;
        }

        const file = parts[0]; // Vi tar den første fila
        const blobName = `${Date.now()}-${file.filename}`; // Unikt navn
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        // Last opp til Azure
        await blockBlobClient.upload(file.data, file.data.length, {
            blobHTTPHeaders: { blobContentType: file.type }
        });

        // Returner URL-en til bildet
        context.res = {
            status: 201,
            body: { url: blockBlobClient.url }
        };

    } catch (err) {
        context.log("Bildeopplasting feilet:", err.message);
        context.res = { status: 500, body: err.message };
    }
};
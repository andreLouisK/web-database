module.exports = async function (context, myTimer) {
    const timeStamp = new Date().toISOString();
    
    // Sjekker om timeren kjører etter planen
    if (myTimer.isPastDue) {
        context.log('Timer function is running late!');
    }
    
    context.log('Azure Keep-Alive triggered at:', timeStamp);
    
    // Valgfritt: Her kan du senere legge inn en SQL-spørring 
    // hvis du vil tvinge databasen til å holde seg våken også.
};
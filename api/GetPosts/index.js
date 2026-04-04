module.exports = async function (context, req) {
    context.res = {
        status: 200,
        body: [{ id: 1, Tittel: "API-et lever!", Innhold: "Nå bør menyen dukke opp" }]
    };
};
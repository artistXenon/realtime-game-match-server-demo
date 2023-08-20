const fs = require('fs');

function neverHappens(from, e) {
    const d = new Date();
    const msg = `[${d}] ${from}:\n${e}\n`;
    console.log(`[${d}] ${from}: UNUSUAL ERROR RECORDED`);
    try {
        fs.appendFileSync('error.txt', msg, 'utf8');
    } 
    catch (err) {} 
}

function axiosError(e) {
    const r = e?.response;
    if (!r) return undefined;
    return {
        status: r.status,
        data: r.data,
        response: r
    };
}

function dbError() {

}

module.exports = {
    neverHappens,
    axiosError,
    dbError
};

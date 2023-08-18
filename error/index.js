const fs = require('fs');

function neverHappens(from, e) {
    const d = new Date();
    const msg = `[${d}]${from}:\n${e}\n`;
    console.log(`[${d}]${from}: UNUSUAL ERROR RECORDED`);
    try {
        fs.appendFileSync('error.txt', msg, 'utf8');
    } 
    catch (err) {} 
}

function axiosError() {
    const r = e?.response;
    if (!r) return undefined;
    return {
        state: r.state,
        data: r.data,
        response: r.response
    };
}

function dbError() {

}

module.exports = {
    neverHappens,
    axiosError,
    dbError
};

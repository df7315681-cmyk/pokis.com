
const axios = require("axios");

async function visit(value) {
    const url = new URL(value);

    if (
        url.hostname !== "pokebonk.com" &&
        url.hostname !== "www.pokebonk.com"
    ) {
        throw new Error("Solo se permite Pokebonk.com");
    }

    const response = await axios.get(url.href, {
        timeout: 20000,
        maxRedirects: 5,
        headers: {
            "User-Agent": "Mozilla/5.0",
            "Accept": "text/html,application/xhtml+xml"
        }
    });

    return response.data;
}

module.exports = { visit };


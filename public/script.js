const form = document.getElementById("visitForm");
const input = document.getElementById("urlInput");

form.addEventListener("submit", (event) => {
    event.preventDefault();

    let url = input.value.trim();

    if (!url) return;

    if (!/^https?:\/\//i.test(url)) {
        url = "https://" + url;
    }

    try {
        const parsed = new URL(url);
        const hostname = parsed.hostname.toLowerCase();

        // PokéBonk
        if (
            hostname === "pokebonk.com" ||
            hostname === "www.pokebonk.com"
        ) {
            window.location.href =
                "/game" + parsed.pathname + parsed.search + parsed.hash;
            return;
        }

        // Poki
        if (
            hostname === "poki.com" ||
            hostname === "www.poki.com"
        ) {
            window.location.href =
                "/poki" + parsed.pathname + parsed.search + parsed.hash;
            return;
        }

        alert("SecretVisit solo admite PokéBonk y Poki por ahora.");

    } catch {
        alert("La dirección no es válida.");
    }
});
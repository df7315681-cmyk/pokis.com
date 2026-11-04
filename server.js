
const express = require("express");
const path = require("path");
const {
    createProxyMiddleware,
    responseInterceptor
} = require("http-proxy-middleware");

const app = express();

const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

// Obtener la dirección pública de SecretVisit
function getBaseUrl(req) {
    const forwardedProto = req.headers["x-forwarded-proto"];
    const protocol = forwardedProto
        ? forwardedProto.split(",")[0].trim()
        : req.protocol;

    return `${protocol}://${req.headers.host}`;
}

// Página de SecretVisit
app.use(express.static(path.join(__dirname, "public")));

// API fija de Pokebonk
app.use("/api", (req, res, next) => {
    const baseUrl = getBaseUrl(req);

    res.setHeader("Access-Control-Allow-Origin", baseUrl);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader(
        "Access-Control-Allow-Headers",
        req.headers["access-control-request-headers"] || "Content-Type, Authorization"
    );

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

app.use("/api", createProxyMiddleware({
    target: "https://api.pokebonk.com",
    changeOrigin: true,
    secure: true,
    pathRewrite: {
        "^/api": ""
    },
    on: {
        proxyReq: (proxyReq) => {
            proxyReq.setHeader("Origin", "https://pokebonk.com");
            proxyReq.setHeader("Referer", "https://pokebonk.com/");
        }
    }
}));

// Juego Pokebonk
app.use("/game", createProxyMiddleware({
    target: "https://pokebonk.com",
    changeOrigin: true,
    secure: true,
    ws: true,
    followRedirects: true,
    selfHandleResponse: true,
    cookieDomainRewrite: "",
    pathRewrite: {
        "^/game": ""
    },
    on: {
        proxyRes: responseInterceptor(async (buffer, proxyRes, req) => {
            const type = proxyRes.headers["content-type"] || "";
            const isJS = /\.(js|mjs)(\?.*)?$/i.test(req.url);

            if (
                !type.includes("text/html") &&
                !type.includes("javascript") &&
                !isJS
            ) {
                return buffer;
            }

            let content = buffer.toString("utf8");
            const baseUrl = getBaseUrl(req);

            content = content.replace(
                /https:\/\/api\.pokebonk\.com/gi,
                `${baseUrl}/api`
            );

            content = content.replace(
                /https:\/\/pokebonk\.com/gi,
                `${baseUrl}/game`
            );

            content = content.replace(
                /(src|href)=("|')\/(?!\/)/gi,
                '$1=$2/game/'
            );

            return content;
        })
    }
}));

// Prueba de Poki
app.use("/poki", createProxyMiddleware({
    target: "https://poki.com",
    changeOrigin: true,
    secure: true,
    ws: true,
    followRedirects: true,
    cookieDomainRewrite: "",
    pathRewrite: {
        "^/poki": ""
    },
    on: {
        proxyRes: responseInterceptor(async (buffer, proxyRes, req) => {
            const type = proxyRes.headers["content-type"] || "";
            const isHTML = type.includes("text/html");

            if (!isHTML) return buffer;

            let content = buffer.toString("utf8");
            const baseUrl = getBaseUrl(req);

            content = content.replace(
                /https:\/\/poki\.com/gi,
                `${baseUrl}/poki`
            );

            content = content.replace(
                /(src|href)=("|')\/(?!\/)/gi,
                '$1=$2/poki/'
            );

            return content;
        })
    }
}));

app.listen(PORT, HOST, () => {
    console.log(`SecretVisit iniciado en ${HOST}:${PORT}`);
});

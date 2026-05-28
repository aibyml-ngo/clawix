const http = require("http");
const httpProxy = require("http-proxy");

const proxy = httpProxy.createProxyServer({});

const PORT = 3000;
const V1_PORT = 3001;
const V2_PORT = 3002;

const server = http.createServer((req, res) => {
  const url = req.url || "";

  if (url.startsWith("/v1")) {
    proxy.web(req, res, { target: `http://localhost:${V1_PORT}` });
  } else if (url.startsWith("/v2")) {
    proxy.web(req, res, { target: `http://localhost:${V2_PORT}` });
  } else {
    res.writeHead(302, { Location: "/v2/" });
    res.end();
  }
});

server.on("upgrade", (req, socket, head) => {
  const url = req.url || "";
  if (url.startsWith("/v1")) {
    proxy.ws(req, socket, head, { target: `http://localhost:${V1_PORT}` });
  } else {
    proxy.ws(req, socket, head, { target: `http://localhost:${V2_PORT}` });
  }
});

proxy.on("error", (err, req, res) => {
  console.error("Proxy error:", err.message);
  if (res.writeHead) {
    res.writeHead(502);
    res.end("Bad Gateway - is the target server running?");
  }
});

server.listen(PORT, () => {
  console.log(`
  Dev proxy running on http://localhost:${PORT}

  Routes:
    http://localhost:${PORT}/v1/  →  v1 (port ${V1_PORT})
    http://localhost:${PORT}/v2/  →  v2 (port ${V2_PORT})
    http://localhost:${PORT}/     →  redirects to /v2/
  `);
});

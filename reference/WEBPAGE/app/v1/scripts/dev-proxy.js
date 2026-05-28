const http = require("http");
const httpProxy = require("http-proxy");

const proxy = httpProxy.createProxyServer({});

const PORT = 3000;
const V1_PORT = 3001;
const V2_PORT = 3002;

const server = http.createServer((req, res) => {
  const url = req.url || "";

  if (url.startsWith("/getclawix.com/v1")) {
    proxy.web(req, res, { target: `http://localhost:${V1_PORT}` });
  } else {
    proxy.web(req, res, { target: `http://localhost:${V2_PORT}` });
  }
});

server.on("upgrade", (req, socket, head) => {
  const url = req.url || "";
  if (url.startsWith("/getclawix.com/v1")) {
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
    http://localhost:${PORT}/getclawix.com/v1/  →  v1 (port ${V1_PORT})
    http://localhost:${PORT}/getclawix.com/     →  v2 (port ${V2_PORT})
  `);
});

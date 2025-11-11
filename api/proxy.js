import { createProxyMiddleware } from "http-proxy-middleware";
import { createServer } from "http";
import zlib from "zlib";

const proxy = createProxyMiddleware({
  target: "https://indiamax.odoo.com",
  changeOrigin: true,
  selfHandleResponse: true,
  secure: true,
  onProxyRes: (proxyRes, req, res) => {
    let chunks = [];

    proxyRes.on("data", chunk => chunks.push(chunk));
    proxyRes.on("end", () => {
      let buffer = Buffer.concat(chunks);

      const encoding = proxyRes.headers["content-encoding"];
      if (encoding === "gzip") {
        buffer = zlib.gunzipSync(buffer);
      } else if (encoding === "deflate") {
        buffer = zlib.inflateSync(buffer);
      }

      let body = buffer.toString("utf8");

      if (proxyRes.headers["content-type"]?.includes("text/html")) {
        body = body.replace(/<link[^>]*href="[^"]*favicon[^"]*"[^>]*>/gi, "");

        body = body.replace(/Powered by <a[^>]*>Odoo<\/a>/gi, "");

        body = body.replace(/<title>.*?<\/title>/i, "<title>Indiamax Properties</title>");
      }

      delete proxyRes.headers["content-encoding"];
      proxyRes.headers["content-length"] = Buffer.byteLength(body);

      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      res.end(body);
    });
  },
  onProxyReq: (proxyReq) => {
    proxyReq.setHeader("host", "indiamax.odoo.com");
  },
  headers: { "Cache-Control": "no-store" },
});

const server = createServer((req, res) => proxy(req, res));
server.listen(3000);

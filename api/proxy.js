import { createProxyMiddleware } from "http-proxy-middleware";
import { createServer } from "http";

const proxy = createProxyMiddleware({
  target: "https://indiamax.odoo.com",
  changeOrigin: true,
  onProxyReq: (proxyReq) => proxyReq.setHeader("host", "indiamax.odoo.com"),
  secure: true,
  headers: { "Cache-Control": "no-store" } // ensures instant updates
});

const server = createServer((req, res) => proxy(req, res));
server.listen(3000);

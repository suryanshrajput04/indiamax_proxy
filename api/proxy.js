import { createProxyMiddleware } from "http-proxy-middleware";
import { createServer } from "http";

const proxy = createProxyMiddleware({
  target: "https://indiamax.odoo.com",
  changeOrigin: true,
  selfHandleResponse: true, // allows modifying the HTML before sending
  secure: true,
  onProxyRes: (proxyRes, req, res) => {
    let body = "";

    proxyRes.on("data", chunk => (body += chunk));
    proxyRes.on("end", () => {
      if (proxyRes.headers["content-type"]?.includes("text/html")) {
        // ✅ Replace Odoo favicon with your own favicon.ico
        body = body.replace(
          /<link[^>]*href="[^"]*favicon[^"]*"[^>]*>/gi,
          '<link rel="icon" type="image/x-icon" href="/favicon.ico">'
        );

        // ✅ Optionally hide the “Powered by Odoo” text
        body = body.replace(/Powered by <a[^>]*>Odoo<\/a>/gi, "");
      }

      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      res.end(body);
    });
  },
  onProxyReq: (proxyReq) => {
    proxyReq.setHeader("host", "indiamax.odoo.com");
  },
  headers: { "Cache-Control": "no-store" } // ensures instant updates
});

const server = createServer((req, res) => proxy(req, res));
server.listen(3000);

// Sanitize container environment global __dirname if set to '.'
if (typeof globalThis !== 'undefined' && (globalThis as any).__dirname === '.') {
  delete (globalThis as any).__dirname;
}
if (typeof global !== 'undefined' && (global as any).__dirname === '.') {
  delete (global as any).__dirname;
}

import 'dotenv/config';
import express from 'express';
import http from 'http';
import net from 'net';
import path from 'path';
import fs from 'fs';
import {
  handleUploadImage,
  handleGetOrders,
  handleCreateOrder,
  handleUpdateOrderStatus,
  handleHealthCheck,
  handleSupabaseStatus,
  handleTriggerMigration,
  handleAdminLogin,
  handleAdminChangePassword,
  handleAdminUpdateProfile,
} from './server/apiHandlers';
import productsHandler from './api/products';

// In Google AI Studio containers, port 3000 is the designated application port routed by nginx.
// If process.env.PORT is explicitly provided and is not 8080 (the internal nginx proxy port), use it;
// otherwise default to 3000.
const rawPort = process.env.PORT ? parseInt(process.env.PORT, 10) : NaN;
const PORT = !isNaN(rawPort) && rawPort !== 8080 ? rawPort : 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Check whether a port is currently free to listen on
function isPortAvailable(port: number, host: string): Promise<boolean> {
  return new Promise((resolve) => {
    const tester = net.createServer();
    tester.once('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(false);
      }
    });
    tester.once('listening', () => {
      tester.close(() => {
        resolve(true);
      });
    });
    tester.listen(port, host);
  });
}

async function startServer() {
  // 0. Ensure we do not start a duplicate instance if another process already listens on the port
  const canListen = await isPortAvailable(PORT, HOST);
  if (!canListen) {
    console.warn(`[FortiMoz Server] Porta ${PORT} (${HOST}) já está em uso por outro processo no ambiente. Não iniciando segunda instância duplicada.`);
    return;
  }

  const app = express();
  const httpServer = http.createServer(app);

  // Support JSON payloads up to 50MB for optimized image uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // ----------------------------------------------------
  // 1. API ROUTES (FIRST)
  // ----------------------------------------------------
  app.get('/api/health', handleHealthCheck);
  app.all('/api/products', (req, res) => productsHandler(req, res));
  app.all('/api/products/:id', (req, res) => {
    if (!req.query) req.query = {};
    if (!req.query.id && req.params?.id) {
      req.query.id = req.params.id;
    }
    return productsHandler(req, res);
  });
  app.post('/api/upload-image', handleUploadImage);
  app.get('/api/orders', handleGetOrders);
  app.post('/api/orders', handleCreateOrder);
  app.put('/api/orders/:id/status', handleUpdateOrderStatus);
  app.get('/api/supabase/status', handleSupabaseStatus);
  app.post('/api/supabase/migrate', handleTriggerMigration);
  app.all('/api/admin/login', (req, res) => {
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Pragma, Cache-Control');
      return res.status(200).end();
    }
    return handleAdminLogin(req, res);
  });
  app.all('/api/admin/change-password', (req, res) => {
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Pragma, Cache-Control');
      return res.status(200).end();
    }
    return handleAdminChangePassword(req, res);
  });
  app.all('/api/admin/profile', (req, res) => {
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Pragma, Cache-Control');
      return res.status(200).end();
    }
    return handleAdminUpdateProfile(req, res);
  });

  // ----------------------------------------------------
  // 2. STATIC ASSETS SERVING WITH SMART CACHE HEADERS
  // ----------------------------------------------------
  const publicUploads = path.resolve(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(publicUploads)) {
    fs.mkdirSync(publicUploads, { recursive: true });
  }

  // Uploaded images (/uploads/*)
  app.use(
    '/uploads',
    express.static(publicUploads, {
      maxAge: '7d',
      setHeaders: (res, filePath) => {
        // Files with content hash / timestamp in name can be safely cached while respecting revalidation
        res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
        res.setHeader('Access-Control-Allow-Origin', '*');
      },
    })
  );

  // Catalog product images (/products/*)
  const publicProducts = path.resolve(process.cwd(), 'public', 'products');
  app.use(
    '/products',
    express.static(publicProducts, {
      maxAge: '1d',
      setHeaders: (res) => {
        // Allow revalidation so updated images are quickly detected
        res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
        res.setHeader('Access-Control-Allow-Origin', '*');
      },
    })
  );

  // ----------------------------------------------------
  // 3. FRONTEND SERVING (Vite in Dev / Static in Prod)
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';

    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: HOST,
        // When HMR is enabled, bind to our existing HTTP server rather than spawning a separate WebSocket on port 24678
        hmr: isHmrDisabled
          ? false
          : {
              server: httpServer,
            },
      },
      appType: 'spa',
    });

    // Mount Vite middleware for dev assets and HMR client
    app.use(vite.middlewares);

    // Dev SPA fallback with Vite HTML transformation (vital for @vitejs/plugin-react preamble)
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      // Skip API and static asset routes
      if (url.startsWith('/api') || url.startsWith('/uploads') || url.startsWith('/products')) {
        return next();
      }

      try {
        const indexPath = path.resolve(process.cwd(), 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        // Transforms index.html to inject Vite React preamble (@vitejs/plugin-react preamble) and scripts
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        console.error('[Vite Dev] Erro ao transformar HTML:', e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Gracefully handle EADDRINUSE if another process bound the port simultaneously
  httpServer.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[FortiMoz Server] Porta ${PORT} já está em uso (EADDRINUSE). Não iniciando segunda instância.`);
      return;
    }
    console.error('[FortiMoz Server] Erro no servidor:', err);
    process.exit(1);
  });

  httpServer.listen(PORT, HOST, () => {
    console.log(`[FortiMoz Server] Operacional em http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[FortiMoz Server] Erro fatal ao iniciar:', err);
  process.exit(1);
});

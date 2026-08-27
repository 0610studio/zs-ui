import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, normalize, resolve } from 'node:path';

const BUILD_DIRECTORY = resolve(process.argv[2] ?? '');
const PORT = Number(process.argv[3] ?? 4178);
const BASE_URL = `http://127.0.0.1:${PORT}`;

const MIME_TYPES = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.otf', 'font/otf'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
]);

function getRequestedFilePath(urlValue) {
  const pathname = decodeURIComponent(new URL(urlValue, BASE_URL).pathname);
  const normalizedPath = normalize(pathname).replace(/^[/\\]+/, '');
  const candidatePath = resolve(BUILD_DIRECTORY, normalizedPath);

  if (!candidatePath.startsWith(BUILD_DIRECTORY)) {
    return null;
  }
  if (existsSync(candidatePath) && statSync(candidatePath).isFile()) {
    return candidatePath;
  }
  return resolve(BUILD_DIRECTORY, 'index.html');
}

const server = createServer((request, response) => {
  const filePath = getRequestedFilePath(request.url ?? '/');
  if (filePath === null || !existsSync(filePath)) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }

  response.writeHead(200, {
    'Cache-Control': 'no-store',
    'Content-Type': MIME_TYPES.get(extname(filePath)) ?? 'application/octet-stream',
  });
  response.end(readFileSync(filePath));
});

server.listen(PORT, '127.0.0.1');

function closeServer() {
  server.close(() => process.exit(0));
}

process.on('SIGINT', closeServer);
process.on('SIGTERM', closeServer);

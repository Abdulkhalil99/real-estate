import request from 'supertest';
import app from '../index';

// We tell TypeScript this variable holds a server we can close after tests
import { Server } from 'http';
let server: Server;

// Before all tests — start the server on a test port
beforeAll((done) => {
  server = app.listen(0, done); // port 0 = OS picks a free port automatically
});

// After all tests — close the server so Jest exits cleanly
afterAll((done) => {
  server.close(done);
});

// ─── TEST SUITE ───────────────────────────────────────────────────────────────
describe('Health check endpoint', () => {
  it('GET /health should return 200 with status ok', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.timestamp).toBeDefined();
  });

  it('GET /api should return 200 with message', async () => {
    const response = await request(app).get('/api');

    expect(response.status).toBe(200);
    expect(response.body.message).toBeDefined();
  });

  it('GET /nonexistent should return 404', async () => {
    const response = await request(app).get('/nonexistent-route');

    expect(response.status).toBe(404);
  });
});
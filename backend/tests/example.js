import { assert } from 'chai';
import { request } from 'chai-http';
import app from '../app.js';

let requester = request.execute('http://localhost:3000');

describe('Example Test Suite', () => {
  it('should get a fail response and 404 status code not found', async () => {
    const res = await requester.get('/api/v1/invalid-endpoint');
    assert.equal(res.status, 404);
    assert.equal(res.body.status, 'fail');
  });
});

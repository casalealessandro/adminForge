import assert from 'node:assert/strict';
import test from 'node:test';
import { parseListQuery } from './list-query.js';

test('parseListQuery normalizes paging and caps page size', () => {
  const result = parseListQuery({ page: '2', pageSize: '500' }, ['name'], 'name');
  assert.equal(result.page, 2);
  assert.equal(result.pageSize, 100);
  assert.equal(result.offset, 100);
});

test('parseListQuery rejects unknown sort columns', () => {
  const result = parseListQuery({ sort: 'DROP TABLE users', order: 'desc' }, ['name'], 'name');
  assert.equal(result.sort, 'name');
  assert.equal(result.order, 'desc');
});

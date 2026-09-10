import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { db } from '../db.js';
import { parseListQuery } from '../http/list-query.js';

export const usersRouter = Router();

const sortColumns: Record<string, string> = {
  firstName: 'first_name', lastName: 'last_name', email: 'email', role: 'role', active: 'active', createdAt: 'created_at',
};
const selectColumns = `id, first_name AS "firstName", last_name AS "lastName", email, role, active,
  created_at AS "createdAt", updated_at AS "updatedAt"`;

usersRouter.get('/', async (req, res, next) => {
  try {
    const q = parseListQuery(req.query as Record<string, unknown>, Object.keys(sortColumns), 'lastName');
    const search = `%${q.search}%`;
    const where = q.search ? 'WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1' : '';
    const params = q.search ? [search] : [];
    const count = await db.query(`SELECT COUNT(*)::int AS total FROM users ${where}`, params);
    const dataParams = [...params, q.pageSize, q.offset];
    const limitIndex = params.length + 1;
    const offsetIndex = params.length + 2;
    const data = await db.query(
      `SELECT ${selectColumns} FROM users ${where} ORDER BY ${sortColumns[q.sort]} ${q.order.toUpperCase()} LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
      dataParams,
    );
    res.json({ items: data.rows, total: count.rows[0].total, page: q.page, pageSize: q.pageSize });
  } catch (error) { next(error); }
});

usersRouter.get('/:id', async (req, res, next) => {
  try {
    const result = await db.query(`SELECT ${selectColumns} FROM users WHERE id = $1`, [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ message: 'User not found' });
    res.json(result.rows[0]);
  } catch (error) { next(error); }
});

usersRouter.post('/', async (req, res, next) => {
  try {
    const { firstName, lastName, email, role = 'user', active = true } = req.body ?? {};
    if (![firstName, lastName, email].every((v) => typeof v === 'string' && v.trim())) return res.status(400).json({ message: 'firstName, lastName and email are required' });
    const id = randomUUID();
    const result = await db.query(
      `INSERT INTO users (id, first_name, last_name, email, role, active) VALUES ($1,$2,$3,$4,$5,$6) RETURNING ${selectColumns}`,
      [id, firstName.trim(), lastName.trim(), email.trim().toLowerCase(), String(role), Boolean(active)],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) { next(error); }
});

usersRouter.put('/:id', async (req, res, next) => {
  try {
    const { firstName, lastName, email, role, active } = req.body ?? {};
    const result = await db.query(
      `UPDATE users SET first_name=COALESCE($2,first_name), last_name=COALESCE($3,last_name), email=COALESCE($4,email), role=COALESCE($5,role), active=COALESCE($6,active), updated_at=NOW() WHERE id=$1 RETURNING ${selectColumns}`,
      [req.params.id, firstName ?? null, lastName ?? null, email?.toLowerCase?.() ?? null, role ?? null, typeof active === 'boolean' ? active : null],
    );
    if (!result.rowCount) return res.status(404).json({ message: 'User not found' });
    res.json(result.rows[0]);
  } catch (error) { next(error); }
});

usersRouter.delete('/:id', async (req, res, next) => {
  try {
    const result = await db.query('DELETE FROM users WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ message: 'User not found' });
    res.status(204).send();
  } catch (error) { next(error); }
});

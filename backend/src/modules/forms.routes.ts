import { Router } from 'express';
import { db } from '../db.js';
import { parseListQuery } from '../http/list-query.js';

export const formsRouter = Router();
const formIdPattern = /^[A-Za-z0-9_-]{1,128}$/;
const sortColumns: Record<string, string> = { id: 'id', name: 'name', createdAt: 'created_at', updatedAt: 'updated_at' };
const selectColumns = `id, name, definition, created_at AS "createdAt", updated_at AS "updatedAt"`;

formsRouter.get('/', async (req, res, next) => {
  try {
    const q = parseListQuery(req.query as Record<string, unknown>, Object.keys(sortColumns), 'name');
    const search = `%${q.search}%`;
    const where = q.search ? 'WHERE id ILIKE $1 OR name ILIKE $1' : '';
    const params = q.search ? [search] : [];
    const count = await db.query(`SELECT COUNT(*)::int AS total FROM forms ${where}`, params);
    const result = await db.query(
      `SELECT ${selectColumns} FROM forms ${where} ORDER BY ${sortColumns[q.sort]} ${q.order.toUpperCase()} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, q.pageSize, q.offset],
    );
    res.json({ items: result.rows, total: count.rows[0].total, page: q.page, pageSize: q.pageSize });
  } catch (error) { next(error); }
});

formsRouter.get('/:id', async (req, res, next) => {
  try {
    const result = await db.query(`SELECT ${selectColumns} FROM forms WHERE id=$1`, [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ message: 'Form not found' });
    res.json(result.rows[0]);
  } catch (error) { next(error); }
});

formsRouter.post('/', async (req, res, next) => {
  try {
    const { id, name, definition } = req.body ?? {};
    if (typeof id !== 'string' || !formIdPattern.test(id) || typeof name !== 'string' || !name.trim() || !Array.isArray(definition)) return res.status(400).json({ message: 'Valid id, name and definition array are required' });
    const result = await db.query(`INSERT INTO forms (id,name,definition) VALUES ($1,$2,$3::jsonb) RETURNING ${selectColumns}`, [id, name.trim(), JSON.stringify(definition)]);
    res.status(201).json(result.rows[0]);
  } catch (error) { next(error); }
});

formsRouter.put('/:id', async (req, res, next) => {
  try {
    const { name, definition } = req.body ?? {};
    if (!formIdPattern.test(req.params.id) || (definition !== undefined && !Array.isArray(definition))) return res.status(400).json({ message: 'Invalid form payload' });
    const result = await db.query(
      `UPDATE forms SET name=COALESCE($2,name), definition=COALESCE($3::jsonb,definition), updated_at=NOW() WHERE id=$1 RETURNING ${selectColumns}`,
      [req.params.id, typeof name === 'string' && name.trim() ? name.trim() : null, definition === undefined ? null : JSON.stringify(definition)],
    );
    if (!result.rowCount) return res.status(404).json({ message: 'Form not found' });
    res.json(result.rows[0]);
  } catch (error) { next(error); }
});

formsRouter.delete('/:id', async (req, res, next) => {
  try {
    const result = await db.query('DELETE FROM forms WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ message: 'Form not found' });
    res.status(204).send();
  } catch (error) { next(error); }
});

import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { db } from '../db.js';
import { parseListQuery } from '../http/list-query.js';

export const productsRouter = Router();

const sortColumns: Record<string, string> = {
  name: 'name', price: 'price', category: 'category', active: 'active', createdAt: 'created_at',
};
const selectColumns = `id, name, description, price::float8 AS price, category, image_url AS "imageUrl", active,
  created_at AS "createdAt", updated_at AS "updatedAt"`;

productsRouter.get('/', async (req, res, next) => {
  try {
    const q = parseListQuery(req.query as Record<string, unknown>, Object.keys(sortColumns), 'name');
    const search = `%${q.search}%`;
    const where = q.search ? 'WHERE name ILIKE $1 OR description ILIKE $1 OR category ILIKE $1' : '';
    const params = q.search ? [search] : [];
    const count = await db.query(`SELECT COUNT(*)::int AS total FROM products ${where}`, params);
    const result = await db.query(
      `SELECT ${selectColumns} FROM products ${where} ORDER BY ${sortColumns[q.sort]} ${q.order.toUpperCase()} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, q.pageSize, q.offset],
    );
    res.json({ items: result.rows, total: count.rows[0].total, page: q.page, pageSize: q.pageSize });
  } catch (error) { next(error); }
});

productsRouter.get('/:id', async (req, res, next) => {
  try {
    const result = await db.query(`SELECT ${selectColumns} FROM products WHERE id=$1`, [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ message: 'Product not found' });
    res.json(result.rows[0]);
  } catch (error) { next(error); }
});

productsRouter.post('/', async (req, res, next) => {
  try {
    const { name, description = null, price, category = null, imageUrl = null, active = true } = req.body ?? {};
    if (typeof name !== 'string' || !name.trim() || !Number.isFinite(Number(price)) || Number(price) < 0) return res.status(400).json({ message: 'Valid name and price are required' });
    const result = await db.query(
      `INSERT INTO products (id,name,description,price,category,image_url,active) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING ${selectColumns}`,
      [randomUUID(), name.trim(), description, Number(price), category, imageUrl, Boolean(active)],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) { next(error); }
});

productsRouter.put('/:id', async (req, res, next) => {
  try {
    const { name, description, price, category, imageUrl, active } = req.body ?? {};
    if (price !== undefined && (!Number.isFinite(Number(price)) || Number(price) < 0)) return res.status(400).json({ message: 'price must be a non-negative number' });
    const result = await db.query(
      `UPDATE products SET name=COALESCE($2,name), description=COALESCE($3,description), price=COALESCE($4,price), category=COALESCE($5,category), image_url=COALESCE($6,image_url), active=COALESCE($7,active), updated_at=NOW() WHERE id=$1 RETURNING ${selectColumns}`,
      [req.params.id, name ?? null, description ?? null, price === undefined ? null : Number(price), category ?? null, imageUrl ?? null, typeof active === 'boolean' ? active : null],
    );
    if (!result.rowCount) return res.status(404).json({ message: 'Product not found' });
    res.json(result.rows[0]);
  } catch (error) { next(error); }
});

productsRouter.delete('/:id', async (req, res, next) => {
  try {
    const result = await db.query('DELETE FROM products WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ message: 'Product not found' });
    res.status(204).send();
  } catch (error) { next(error); }
});

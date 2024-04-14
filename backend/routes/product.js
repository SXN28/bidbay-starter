import express from 'express';
import { Product, User } from '../orm/index.js';
import authMiddleware from '../middlewares/auth.js';

const router = express.Router();

router.get('/api/products', async (req, res, next) => {
  try {
    const products = await Product.findAll({ include: { all: true } })
    res.status(200).json(products)
  } catch (error) {
    console.error('Error:', error)
    res.sendStatus(500)
  }
});

router.get('/api/products/:productId', async (req, res) => {
  try {
    const product = await Product.findOne({ where: { id: req.params.productId }, include: { all: true, nested: true } })
    if (product) {
      res.status(200).json(product)
    } else {
      res.status(404).send()
    }
  } catch (error) {
    console.error('Error:', error)
    res.sendStatus(500)
  }
});

router.post('/api/products', authMiddleware, async (req, res, next) => {
  try {
    const { name, description, originalPrice } = req.body;
    if (!name || !description || !originalPrice || isNaN(parseFloat(originalPrice))) {
      return res.status(400).json({ error: 'Invalid or missing fields' });
    }
    const product = { ...req.body, sellerId: req.user.id };
    const newProduct = await Product.create(product);
    if (!newProduct) {
      throw new Error('Failed to create product');
    }
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




router.put('/api/products/:productId', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findOne({ where: { id: req.params.productId } });
    if (!product) {
      return res.sendStatus(404);
    }
    if (product.sellerId !== req.user.id && !req.user.admin) {
      return res.sendStatus(403);
    }
    await Product.update(req.body, { where: { id: req.params.productId } });
    res.sendStatus(200);
  } catch (error) {
    console.error('Error:', error)
    res.sendStatus(500);
  }
});


router.delete('/api/products/:productId', authMiddleware, async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    if (product.sellerId !== req.user.id && !req.user.admin) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await product.destroy();
    res.status(204).end();
  } catch (error) {
    console.error('Une erreur s\'est produite lors de la suppression du produit :', error);
    res.status(500).json({ message: 'Une erreur s\'est produite lors de la suppression du produit' });
  }
});




export default router;

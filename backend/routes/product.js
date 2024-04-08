import express from 'express';
import { Product, User } from '../orm/index.js';
import authMiddleware from '../middlewares/auth.js';

const router = express.Router();

router.get('/api/products', async (req, res, next) => {
  try {
    /** @type {ProductObject | null} */
    // Récupérer tous les produits avec toutes les associations
    const products = await Product.findAll({ include: { all: true } })
    res.status(200).json(products)
  } catch (error) {
    console.error('Error:', error)
    res.sendStatus(500)
  }
});

router.get('/api/products/:productId', async (req, res) => {
  try {
    /** @type {ProductObject | null} */
    // Trouver un produit par son ID avec toutes les associations
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
    /** @type {ProductObject | null} */
    // Créer un nouveau produit avec le vendeur associé
    let product = req.body;
    product.sellerId = req.user.id;
    /** @type {ProductObject | null} */
    const newProduct = await Product.create(product);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error:', error)
    res.status(400).json({ error: 'Invalid or missing fields', details: getDetails(error) })
  }
});


router.put('/api/products/:productId', authMiddleware, async (req, res) => {
  try {
    // Trouver le produit à mettre à jour
    /** @type {ProductObject | null} */
    const product = await Product.findOne({ where: { id: req.params.productId } });
    if (!product) {
      return res.sendStatus(404);
    }
    // Vérifier les autorisations
    if (product.sellerId !== req.user.id && !req.user.admin) {
      return res.sendStatus(403);
    }
    // Mettre à jour le produit
    await Product.update(req.body, { where: { id: req.params.productId } });
    res.sendStatus(200);
  } catch (error) {
    console.error('Error:', error)
    res.sendStatus(500);
  }
});


router.delete('/api/products/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;

    // Recherche du produit par son ID
    const product = await Product.findByPk(productId);

    // Vérifiez si le produit existe
    if (!product) {
      // Si le produit n'est pas trouvé, renvoyer une erreur 404
      return res.status(404).json({ error: 'Product not found' });
    }

    // Supprimez le produit de la base de données
    await product.destroy();

    // Réponse indiquant que le produit a été supprimé avec succès
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Une erreur s\'est produite lors de la suppression du produit :', error);
    res.status(500).json({ message: 'Une erreur s\'est produite lors de la suppression du produit' });
  }
});

export default router;

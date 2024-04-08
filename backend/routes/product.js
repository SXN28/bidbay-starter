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
    const { name, description, originalPrice } = req.body;

    // Vérifier si les champs requis sont présents et valides
    if (!name || !description || !originalPrice || isNaN(parseFloat(originalPrice))) {
      return res.status(400).json({ error: 'Invalid or missing fields' });
    }

    // Ajouter l'ID du vendeur à la requête
    const product = { ...req.body, sellerId: req.user.id };

    // Créer le nouveau produit
    const newProduct = await Product.create(product);

    // Vérifier si la création du produit a réussi
    if (!newProduct) {
      throw new Error('Failed to create product');
    }

    // Répondre avec le nouveau produit créé
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




router.put('/api/products/:productId', authMiddleware, async (req, res) => {
  try {
    // Trouver le produit à mettre à jour
    const product = await Product.findOne({ where: { id: req.params.productId } });
    if (!product) {
      return res.sendStatus(404);
    }
    // Vérifier les autorisations
    if (product.sellerId !== req.user.id && !req.user.admin) {
      return res.sendStatus(403); // Accès interdit
    }
    // Mettre à jour le produit
    await Product.update(req.body, { where: { id: req.params.productId } });
    res.sendStatus(200); // Succès de la mise à jour
  } catch (error) {
    console.error('Error:', error)
    res.sendStatus(500); // Erreur interne du serveur
  }
});


router.delete('/api/products/:productId', authMiddleware, async (req, res) => {
  try {
    const productId = req.params.productId;

    // Recherche du produit par son ID
    const product = await Product.findByPk(productId);

    // Vérifiez si le produit existe
    if (!product) {
      // Si le produit n'est pas trouvé, renvoyer une erreur 404
      return res.status(404).json({ error: 'Product not found' });
    }

    // Vérifiez les autorisations - seulement le vendeur ou un administrateur peut supprimer le produit
    if (product.sellerId !== req.user.id && !req.user.admin) {
      // Si l'utilisateur n'est pas autorisé, renvoyer une erreur 403
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Supprimez le produit de la base de données
    await product.destroy();

    // Réponse indiquant que le produit a été supprimé avec succès
    res.status(204).end(); // Utilisez le code de statut 204 et end() pour indiquer qu'il n'y a pas de contenu dans la réponse
  } catch (error) {
    console.error('Une erreur s\'est produite lors de la suppression du produit :', error);
    res.status(500).json({ message: 'Une erreur s\'est produite lors de la suppression du produit' });
  }
});




export default router;

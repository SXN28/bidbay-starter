import express from 'express'
import { Product, Bid, User } from '../orm/index.js'
import authMiddleware from '../middlewares/auth.js'
import { getDetails } from '../validators/index.js'

const router = express.Router()

router.get('/api/products', async (req, res, next) => {
  try {
    const products = await Product.findAll({
      include: {
        model: User,
        as: 'seller'
      }
    });
    res.json(products);
  } catch (error) {
    // Gérer les erreurs de manière appropriée
    console.error('Une erreur s\'est produite lors de la récupération des produits :', error);
    res.status(500).json({ message: 'Une erreur s\'est produite lors de la récupération des produits' });
  }
});

router.get('/api/products/:productId', async (req, res) => {
  res.status(600).send()
})

// You can use the authMiddleware with req.user.id to authenticate your endpoint ;)

router.post('/api/products', async (req, res) => {
  try {
    const { name, description, category, originalPrice, pictureUrl, endDate, sellerId } = req.body;

    if (!name || !description || !category || !originalPrice || !endDate || !sellerId) {
      return res.status(400).json({ message: 'Toutes les données nécessaires ne sont pas fournies' });
    }

    // Optionnel : Vérifier si l'utilisateur (sellerId) existe dans la base de données avant de créer le produit

    const newProduct = await Product.create({
      name,
      description,
      category,
      originalPrice,
      pictureUrl,
      endDate,
      sellerId,
    });

    res.status(201).json(newProduct);
  } catch (error) {
    // Gérer l'erreur correctement en renvoyant une réponse d'erreur au client
    console.error('Une erreur s\'est produite lors de la création du produit :', error);
    res.status(500).json({ message: 'Une erreur s\'est produite lors de la création du produit' });
  }
});

router.put('/api/products/:productId', async (req, res) => {
  res.status(600).send()
})

router.delete('/api/products/:productId', authMiddleware, async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }
    await product.destroy();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router

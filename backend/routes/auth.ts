import { User } from '../orm/index.js'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../consts/secret.js'
import express from 'express'
import { getDetails } from '../validators/index.js'

const router = express.Router()

/**
 * Endpoint pour la création d'un nouvel utilisateur
 */
router.post('/api/auth/register', async (req, res) => {
  try {
    const reqBody = req.body
    const { username, email, password } = reqBody

    // Vérifier si l'utilisateur existe déjà
    const userWithSameEmail = await User.findOne({ where: { email } })

    if (userWithSameEmail) {
      return res.status(409).json({ error: 'E-mail already used' })
    }

    // Vérifier si l'utilisateur existe déjà
    const userWithSameUsername = await User.findOne({
      attributes: ['id', 'username', 'email', 'admin'],
      where: { username }
    })

    if (userWithSameUsername) {
      return res.status(409).json({ error: 'Username already used' })
    }

    // Créer le nouvel utilisateur
    const newUser = await User.create({
      username,
      email,
      password
    })

    // Générer un token JWT pour l'authentification future
    const payload = {
      id: newUser.id,
      username,
      email,
      admin: email.endsWith('@admin.org')
    }
    const token = jwt.sign(payload, JWT_SECRET)

    // Renvoyer l'utilisateur et le token
    res.status(201).json({ access_token: token })
  } catch (e) {
    res.status(400).json({ error: 'Invalid or missing information', details: getDetails(e as Error) })
  }
})

router.post('/api/auth/login', async (req, res) => {

  const reqBody = req.body
  const { email, password } = reqBody

  try {
    // Vérifier si l'utilisateur existe
    const user = await User.findOne({
      where: { email }
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    console.log(user.password, password)

    // Vérifier le mot de passe de l'utilisateur
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials.' })
    }

    // Générer un token JWT pour l'authentification future
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      admin: user.admin
    }
    const token = jwt.sign(payload, JWT_SECRET)

    // Renvoyer le token
    res.status(200).json({ access_token: token })
  } catch (e) {
    res.status(401).json({ error: 'Invalid credentials', details: getDetails(e as Error) })
  }
})

export default router

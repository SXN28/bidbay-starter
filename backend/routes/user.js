import express from 'express'
import { User, Product, Bid } from '../orm/index.js'

const router = express.Router()

router.get('/api/users/:userId', async (req, res) => {
  let user = await User.findOne({where : {id : req.params.userId}, include:{all: true,nested: true}})
  if(user != null){
    res.status(200).json(user)
  }else{
    res.status(404).send()}
})




export default router

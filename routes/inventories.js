var express = require('express')
var router = express.Router()
let inventoryController = require('../controllers/inventories')

// GET all inventories (join với product)
router.get('/', async function (req, res, next) {
    try {
        let data = await inventoryController.getAll()
        res.send(data)
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
})

// GET inventory by ID (join với product)
router.get('/:id', async function (req, res, next) {
    try {
        let id = req.params.id
        let data = await inventoryController.getById(id)
        if (!data) return res.status(404).send({ message: 'Inventory not found' })
        res.send(data)
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
})

// POST add_stock - tăng stock
router.post('/add_stock', async function (req, res, next) {
    try {
        let { product, quantity } = req.body
        if (!product || !quantity || quantity <= 0)
            return res.status(400).send({ message: 'product và quantity (> 0) là bắt buộc' })
        let result = await inventoryController.addStock(product, quantity)
        if (!result) return res.status(404).send({ message: 'Inventory not found for this product' })
        res.send(result)
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
})

// POST remove_stock - giảm stock
router.post('/remove_stock', async function (req, res, next) {
    try {
        let { product, quantity } = req.body
        if (!product || !quantity || quantity <= 0)
            return res.status(400).send({ message: 'product và quantity (> 0) là bắt buộc' })
        let result = await inventoryController.removeStock(product, quantity)
        res.send(result)
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
})

// POST reservation - giảm stock, tăng reserved
router.post('/reservation', async function (req, res, next) {
    try {
        let { product, quantity } = req.body
        if (!product || !quantity || quantity <= 0)
            return res.status(400).send({ message: 'product và quantity (> 0) là bắt buộc' })
        let result = await inventoryController.reservation(product, quantity)
        res.send(result)
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
})

// POST sold - giảm reserved, tăng soldCount
router.post('/sold', async function (req, res, next) {
    try {
        let { product, quantity } = req.body
        if (!product || !quantity || quantity <= 0)
            return res.status(400).send({ message: 'product và quantity (> 0) là bắt buộc' })
        let result = await inventoryController.sold(product, quantity)
        res.send(result)
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
})

module.exports = router

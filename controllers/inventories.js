let inventoryModel = require('../schemas/inventories')

module.exports = {
    // Tạo inventory khi tạo product
    createInventory: async function (productId) {
        let inventory = new inventoryModel({ product: productId })
        await inventory.save()
        return inventory
    },

    // Lấy tất cả inventory (join với product)
    getAll: async function () {
        return await inventoryModel.find().populate({
            path: 'product',
            select: 'title slug price category'
        })
    },

    // Lấy inventory theo ID (join với product)
    getById: async function (id) {
        return await inventoryModel.findById(id).populate({
            path: 'product',
            select: 'title slug price category'
        })
    },

    // Tăng stock
    addStock: async function (productId, quantity) {
        return await inventoryModel.findOneAndUpdate(
            { product: productId },
            { $inc: { stock: quantity } },
            { new: true }
        )
    },

    // Giảm stock
    removeStock: async function (productId, quantity) {
        const inventory = await inventoryModel.findOne({ product: productId })
        if (!inventory) throw new Error('Inventory not found')
        if (inventory.stock < quantity) throw new Error('Not enough stock')
        inventory.stock -= quantity
        await inventory.save()
        return inventory
    },

    // Giảm stock, tăng reserved
    reservation: async function (productId, quantity) {
        const inventory = await inventoryModel.findOne({ product: productId })
        if (!inventory) throw new Error('Inventory not found')
        if (inventory.stock < quantity) throw new Error('Not enough stock to reserve')
        inventory.stock -= quantity
        inventory.reserved += quantity
        await inventory.save()
        return inventory
    },

    // Giảm reserved, tăng soldCount
    sold: async function (productId, quantity) {
        const inventory = await inventoryModel.findOne({ product: productId })
        if (!inventory) throw new Error('Inventory not found')
        if (inventory.reserved < quantity) throw new Error('Not enough reserved quantity')
        inventory.reserved -= quantity
        inventory.soldCount += quantity
        await inventory.save()
        return inventory
    }
}

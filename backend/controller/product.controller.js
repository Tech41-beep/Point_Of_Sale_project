const Product = require('../model/product.model');

const getAllProducts = async (req, res) => {
 try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Advanced search and filter
    const reservedFields = ['page', 'limit', 'sort', 'search'];
    const queryFilter = { ...req.query };
    reservedFields.forEach((field) => delete queryFilter[field]);

    const filterString = JSON.stringify(queryFilter)
      .replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);
    const filter = JSON.parse(filterString);

    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { code: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const sortOptions = req.query.sort
      ? req.query.sort.split(',').join(' ')
      : '-createdAt';

    const [products, totalItems] = await Promise.all([
      Product.find(filter)
        .populate('category')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      Product.countDocuments(filter),
    ]);
    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      message: "Successfully retrieved all products",
      success: true,
      result: products,
      totalPages: totalPages,
      currentPage: page,
      totalItems: totalItems,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
const findOne = async (req, res) => {
    try{
        const { id } = req.params;
        const product = await Product.findById(id).populate('category');
        if(!product){
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            })
        }
        res.status(200).json({
            success: true,
            result: product,
        })
    }catch(error){
        res.status(500).json({
        success: false,
        message: error.message,
    })
}
}

const findOneByCode = async (req, res) => {
    try{
        const code = req.params.code;
        const product = await Product.findOne({ code }).populate('category');
        if(!product){
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            })
        }
        res.status(200).json({
            success: true,
            result: product,
        })
    }catch(error){
        res.status(500).json({
        success: false,
        message: error.message,
    })
}
}

const createProduct = async (req, res) => { 
    try{
        const product = new Product(req.body);
        const savedProduct = await product.save();
        res.status(201).json({
            success: true,
            result: savedProduct,
        })
    }catch(error){
        res.status(500).json({
            success: false,
            message: error.message,
        })  
    }
}

const updateProduct = async (req, res) => {
    try{
        const { id } = req.params;
        const product = await Product.findByIdAndUpdate(id, req.body, {
            new: true,
        });
        if(!product){
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            })
        }
        res.status(200).json({
            success: true,
            result: product,
        })
    }catch(error){
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}
const deleteProduct = async (req, res) => {
    try{
        const { id } = req.params;
        const product = await Product.findByIdAndDelete(id);
        if(!product){
            return res.status(404).json({
                success: false,
                message:"product not found",
            })
        }
        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
            result: product,
        })
    }catch(error){
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

module.exports = {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    findOne,
    findOneByCode
}

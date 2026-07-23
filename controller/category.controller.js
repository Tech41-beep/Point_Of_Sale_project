const Category = require("../model/category.model");

//create the category using POST method
const create = async (req, res) => {
  try {
    const category = new Category(req.body);
    const result = await category.save();
    const exist= await Category.findOne({ id: req.body.id });
    if(exist){
      res.status(400).json({
        success: false,
        message: "Category with this id already exists"
      })
    }
    res.status(201).json({
      success: true,
      result: result,
    });
    console.log(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

const findAll = async (req, res) => {
  try {
    // const categories = await Category.find();
    const page= req.query.page || 1 ;
    const limit= req.query.limit || 10 ;
    const skip= (page-1)*limit; 
    const doc= await Category.find().skip(skip).limit(limit).sort({_id: -1}).exec(); // limit for pagination
    const querySearch= {}; // search query object
    const sort= req.query.sort || "createdAt"; // sort by createdAt by default
    const totalItems = await Category.find (querySearch).countDocuments(); // total items for pagination
    const totalPages= Math.ceil(totalItems/limit); // total pages for pagination
    if(req.query.search){
      querySearch["$or"]=[
        {name: {$regex: req.query.search, $options: "i"}},
        {note: {$regex: req.query.search, $options: "i"}}
      ]
    }
    res.status(200).json({
      message: "Successfully get all the categories",
      success: true,
      result: doc,
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
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
    res.status(200).json({
      success: true,
      result: category,
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedCategory = await Category.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedCategory) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
    } else {
      res.status(200).json({
        success: true,
        result: updatedCategory,
      });
    }
  } catch (error) {
    next(error);
  }
};

const Remove = async (req, res) => {
  try {
    const id = req.params.id;
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      result: category,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  findAll,
  findOne,
  update,
  Remove,
};

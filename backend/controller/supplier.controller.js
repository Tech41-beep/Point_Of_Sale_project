const Supplier= require("../model/supplier.model");

//create the customer using POST method
const create = async (req, res) => {
  try {
    const exist = await Supplier.findOne({ id: req.body.id });
    if (exist) {
      return res.status(400).json({
        success: false,
        message: "Supplier with this id already exists",
      });
    }

    const supplier = new Supplier(req.body);
    const result = await supplier.save();
    res.status(201).json({
      success: true,
      result: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

const findAll = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;
    const querySearch = {};

    if (req.query.search) {
      querySearch.$or = [
        { id: { $regex: req.query.search, $options: "i" } },
        { businessName: { $regex: req.query.search, $options: "i" } },
        { name: { $regex: req.query.search, $options: "i" } },
        { phone: { $regex: req.query.search, $options: "i" } },
        { address: { $regex: req.query.search, $options: "i" } },
        { note: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const [doc, totalItems] = await Promise.all([
      Supplier.find(querySearch).skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
      Supplier.countDocuments(querySearch),
    ]);
    const totalPages = Math.ceil(totalItems / limit);
    res.status(200).json({
      message: "Successfully get all the supplier",
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

const findOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findById(id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }
    res.status(200).json({
      success: true,
      result: supplier,
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const id = req.params.id;
    const updatedSupplier= await Supplier.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedSupplier) {
      res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    } else {
      res.status(200).json({
        success: true,
        result: updatedSupplier,
      });
    }
  } catch (error) {
    next(error);
  }
};

const Remove = async (req, res, next) => {
  try {
    const id = req.params.id;
    const  supplier = await Supplier.findByIdAndDelete(id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Supplier deleted successfully",
      result: supplier,
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

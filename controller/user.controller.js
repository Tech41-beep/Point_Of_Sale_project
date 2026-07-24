const User = require("../model/user.model");

//create the customer using POST method
const create = async (req, res) => {
  try {
    const user = new User(req.body);
    const result = await user.save();
    const exist= await User.findOne({ id: req.body.id });
    if(exist){
      res.status(400).json({
        success: false,
        message: "User with this id already exists"
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
    // const customers = await Customers.find();
    const page= req.query.page || 1 ;
    const limit= req.query.limit || 10 ;
    const skip= (page-1)*limit; 
    const doc= await User.find().skip(skip).limit(limit).sort({_id: -1}).exec(); // limit for pagination
    const querySearch= {}; // search query object
    const sort= req.query.sort || "createdAt"; // sort by createdAt by default
    const totalItems = await User.find (querySearch).countDocuments(); // total items for pagination
    const totalPages= Math.ceil(totalItems/limit); // total pages for pagination
    if(req.query.search){
      querySearch["$or"]=[
        {name: {$regex: req.query.search, $options: "i"}},
        {note: {$regex: req.query.search, $options: "i"}}
      ]
    }
    res.status(200).json({
      message: "Successfully get all the user",
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
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      result: user,
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedUser= User.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedUser    ) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    } else {
      res.status(200).json({
        success: true,
        result: updatedUser,
      });
    }
  } catch (error) {
    next(error);
  }
};

const Remove = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      result: user,
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

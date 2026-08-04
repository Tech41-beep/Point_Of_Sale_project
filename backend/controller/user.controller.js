const User = require("../model/user.model");
const bcrypt = require("bcrypt");

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
    const doc= await User.find({
      ...req.query.search,
      email: { $ne: req.user.email }, // Exclude the current user's email from the search results
      role: { $ne: "super_admin" } // Exclude users with the role of "super_admin"
        
    }).skip(skip).limit(limit).sort({_id: -1}).exec(); // limit for pagination
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

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    const isSuperAdmin = req.user.role === "super_admin";
    const isOwnProfile = req.user._id.toString() === id;

    if (!isSuperAdmin && !isOwnProfile) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only update your own profile.",
      });
    }

    if (role !== undefined && !isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only super_admin can update the role.",
      });
    }

    if (password !== undefined && password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email.toLowerCase();
    if (role !== undefined) user.role = role.toLowerCase();
    if (password !== undefined) {
      user.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await user.save();
    const result = updatedUser.toObject();
    delete result.password;

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }
    next(error);
  }
};

const Remove = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByIdAndDelete(id);
    const doc = await User.findById(id);
    if(doc.role=="super_admin"){
      return res.status(403).json({
        success: false,
        message: "Access denied. You cannot delete a super_admin.",
      });
    }
    if(doc.role=="admin" && req.user.role !== "super_admin"){
      return res.status(403).json({
        success: false,
        message: "Access denied. Only super_admin can delete an admin.",
      });
    }
    if(req.user.role !== "super_admin" && req.user._id.toString() !== id){
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only delete your own profile.",
      });
    }
    
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

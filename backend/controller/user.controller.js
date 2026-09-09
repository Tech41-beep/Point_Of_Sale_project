const User = require("../model/user.model");
const bcrypt = require("bcrypt");

//create the customer using POST method
const create = async (req, res) => {
  try {
    const {id, name, email, password, role, note } = req.body;

    if(!id || !name || !email || !password || !role){
      return res.status(400).json({
        success: false,
        message: "User ID, name, email, password and role are required"
      });
    }

    if(password.length < 8){
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long"
      });
    }

    const normalizedEmail = email.toLowerCase();
    const normalizedRole = role.toLowerCase();
    const exist = await User.findOne({
      $or: [{ id: id.trim() }, { email: normalizedEmail }]
    });

    if(exist){
      return res.status(400).json({
        success: false,
        message: exist.id === id.trim()
          ? "User with this ID already exists"
          : "Email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      id: id.trim(),
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: normalizedRole,
      note,
    });
    const result = await user.save();
    const responseResult = result.toObject();
    delete responseResult.password;

    res.status(201).json({
      success: true,
      result: responseResult,
    });
  } catch (error) {
    if(error.code === 11000){
      return res.status(400).json({
        success: false,
        message: "User ID or email already exists",
      });
    }
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
    const querySearch= {
      email: { $ne: req.user.email }, // Exclude the current user's email from the search results
      role: { $ne: "super_admin" } // Exclude users with the role of "super_admin"
    }; // search query object
    const sort= req.query.sort || "createdAt"; // sort by createdAt by default
    if(req.query.search){
      querySearch["$or"]=[
        {name: {$regex: req.query.search, $options: "i"}},
        {email: {$regex: req.query.search, $options: "i"}}
      ]
    }
    const [doc, totalItems] = await Promise.all([
      User.find(querySearch).skip(skip).limit(limit).sort({_id: -1}).exec(),
      User.countDocuments(querySearch)
    ]); // limit and total items for pagination
    const totalPages= Math.max(1, Math.ceil(totalItems/limit)); // total pages for pagination
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

const Remove = async (req, res, next) => {
  try {
    const id = req.params.id;
    const doc = await User.findById(id);
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
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
    const user = await User.findByIdAndDelete(id);
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

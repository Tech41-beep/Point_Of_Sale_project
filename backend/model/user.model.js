const { default: mongoose } = require("mongoose");

const schema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
      minlength: [8, "Password must be at least 8 characters long"],
    },
    role:{
        type: String,
        enum: ['super_admin','admin', 'user', 'cashier'],
        required: [true, 'Role is required'],
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
   
  },
  {
    timestamps: true,
  },
);

const User= mongoose.model("User", schema);

module.exports = User;

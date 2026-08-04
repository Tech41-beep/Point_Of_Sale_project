const { default: mongoose } = require("mongoose");

const schema = new mongoose.Schema(
  {
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
   
  },
  {
    timestamps: true,
  },
);

const User= mongoose.model("User", schema);

module.exports = User;

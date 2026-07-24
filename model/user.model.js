const { default: mongoose } = require("mongoose");

const schema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    Username: {
      type: String,
      required: true,
      
    },
    email:{
        type: String,
        required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: [8, "Password must be at least 8 characters long"],
    },
    role:{
        type: String
    },
   
  },
  {
    timestamps: true,
  },
);

const User= mongoose.model("User", schema);

module.exports = User;

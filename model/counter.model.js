const { default: mongoose } = require("mongoose");

const schema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    
    sequenceValue: {
      type: Number,
      required: true,
    },
 
   
  },
  {
    timestamps: true,
  },
);

const User= mongoose.model("User", schema);

module.exports = User;

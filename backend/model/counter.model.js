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

const Counter = mongoose.model("Counter", schema);

module.exports = Counter;

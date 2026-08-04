const { default: mongoose } = require("mongoose");

const schema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    supplier:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier",
        required: true,
    },
    invoiceNumber:{
        type: String,
        required: true,
        unique: true,
    },
    purchaseDate:{
        type: Date,
        required: true,
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min:1,
        },
        price: {
            type: Number,
            required: true,
            min: [0, "Price cannot be negative"],
        }
    }],
    totalCost:{ 
        type: Number,
        required: [true, "Total cost is required"],
        min: [0, "Total cost cannot be negative"], 
    },
    paidAmount: {
        type: Number,
        required: true,
    },
    dueAmount: {
        type: Number,
        required: true,
    },
    changeAmount: {
        type: Number,
        required: true,
    },
     purchaseStatus:{
        type: String,
        enum: ['pending', 'received', 'cancelled'],
        default: 'pending',
        required: true,
     },
     paymentStatus:{
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
        required: true,
     }
},{
    timestamps: true,
})

const Purchase = mongoose.model("Purchase", schema);

module.exports = Purchase;

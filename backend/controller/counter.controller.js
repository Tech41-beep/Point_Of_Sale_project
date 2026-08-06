const Counter = require('../model/counter.model');

const generateCodeProduct = async (req, res) => {
try{
const result= await Counter.findOneAndUpdate(
    {id: "productCode"},
    {$inc:{sequenceValue:1}},
    {new: true, upsert: true}
)
//padstart function javascript use to add leading zeros to the number and make it 5 digits long
const productCode= String(result.sequenceValue).padStart(6, '0');
res.status(200).json({
    success: true,
    result: productCode
})
}catch(error){
    res.status(500).json({
        success: false,
        message: error.message,
    })
}
}

const generateInvoiceNumber = async () => {
const result = await Counter.findOneAndUpdate(
    {id: "invoiceNumber"},
    {$inc:{sequenceValue:1}},
    {new: true, upsert: true}
)
return String(result.sequenceValue).padStart(6, '0');
}

module.exports= {
    generateCodeProduct,
    generateInvoiceNumber
}

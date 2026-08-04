
// create function calculatePaymentStatus 
function calculatePaymentStatus(totalCost, paidAmount) {
    return paidAmount >= totalCost ? "completed" : "pending";
}
module.exports = calculatePaymentStatus;

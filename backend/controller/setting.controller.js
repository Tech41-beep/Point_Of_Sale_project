const Settings = require("../model/setting.model");

const editableFields = [
  "storeName", "currency", "taxRate", "defaultPaymentMethod",
  "allowDiscount", "maxDiscount", "allowNegativeStock",
  "lowStockThreshold", "autoPrintReceipt", "receiptFooter",
];

// Get settings
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    // Create default settings if none exist
    if (!settings) {
      settings = await Settings.create({});
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get settings",
      error: error.message,
    });
  }
};

// Update settings
const updateSettings = async (req, res) => {
  try {
    const updates = Object.fromEntries(
      editableFields
        .filter((field) => Object.prototype.hasOwnProperty.call(req.body, field))
        .map((field) => [field, req.body[field]]),
    );

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid settings were provided",
      });
    }

    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: updates },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      data: settings,
    });
  } catch (error) {
    const isValidationError = error.name === "ValidationError";
    res.status(isValidationError ? 400 : 500).json({
      success: false,
      message: "Failed to update settings",
      ...(process.env.NODE_ENV === "development" && { error: error.message }),
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};

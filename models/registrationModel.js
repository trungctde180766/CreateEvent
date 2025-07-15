// models/registrationModel.js
const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  eventId: { type: String, required: true },
  registrationDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Registration", registrationSchema);

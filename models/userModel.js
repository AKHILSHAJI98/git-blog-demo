const mongoose = require("mongoose");

const accountSchema = mongoose.Schema(
  {
    fname: String,
    lname: String,
    phone: Number,
    acno: Number,
    password: String,
    balance: Number,
    transaction: []
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Account", accountSchema);

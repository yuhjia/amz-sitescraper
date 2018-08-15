const mongoose = require("mongoose");

//Define a schema
const Schema = mongoose.Schema;

const productSchema = Schema({
    asin: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 10
    },
    dimension: {
      type: String
    },
    ranks: {
      type: []
    },
    title: {
      type: String
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
});

module.exports = mongoose.model('product', productSchema);
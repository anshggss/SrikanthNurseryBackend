const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: String,
  description: String,
  icon: String
});

module.exports = mongoose.model('Service', serviceSchema);

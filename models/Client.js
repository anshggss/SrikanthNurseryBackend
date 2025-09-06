const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: String,
  type: String,
  fullName: String,
  location: String,
  projectValue: String,
  project: String
});

module.exports = mongoose.model('Client', clientSchema);

const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: String,
  location: String,
  description: String,
  image: String,
  category: String,
  plantSpecies: [String]
});

module.exports = mongoose.model('Project', projectSchema);

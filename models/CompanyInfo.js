const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: String,
  established: {
    srikanthNursery: Number,
    laxmiAssociates: Number
  },
  experience: Number,
  area: String,
  location: String,
  turnover: String,
  mission: String,
  vision: String,
  contact: {
    phone: String,
    email: String,
    address: String
  }
});

module.exports = mongoose.model('CompanyInfo', companySchema);

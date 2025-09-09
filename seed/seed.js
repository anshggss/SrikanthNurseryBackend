const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('../config/database');
const CompanyInfo = require('../models/CompanyInfo');
const Service = require('../models/Service');
const Project = require('../models/Project');
const Client = require('../models/Client');

const data = require('./data/nursery-data.json');

const seedDB = async () => {
  try {
    await connectDB();

    // Clear existing data
    await CompanyInfo.deleteMany({});
    await Service.deleteMany({});
    await Project.deleteMany({});
    await Client.deleteMany({});

    // Insert data
    await CompanyInfo.create(data.companyInfo);
    await Service.insertMany(data.services);
    await Project.insertMany(data.projects);
    await Client.insertMany(data.clients);

    console.log('🌱 Database seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();

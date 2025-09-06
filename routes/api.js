const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const fs = require('fs').promises;
const path = require('path');
const nodemailer = require('nodemailer')

// Import models
const CompanyInfo = require('../models/CompanyInfo');
const Service = require('../models/Service');
const Project = require('../models/Project');
const Client = require('../models/Client');

/* -------------------- COMPANY INFO -------------------- */
router.get('/company', async (req, res) => {
  try {
    const companyInfo = await CompanyInfo.findOne({});
    if (!companyInfo) {
      return res.status(404).json({ success: false, error: 'Company info not found' });
    }
    res.json({ success: true, data: companyInfo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/* -------------------- SERVICES -------------------- */
router.get('/services', async (req, res) => {
  try {
    const services = await Service.find({});
    res.json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/services/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, error: 'Service not found' });
    res.json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/* -------------------- PROJECTS -------------------- */
router.get('/projects', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category: { $regex: new RegExp(category, 'i') } } : {};
    const projects = await Project.find(filter);
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/projects/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/projects', upload.single('image'), async (req, res) => {
  try {
    const { name, category, description, location, featured } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Image is required' });
    }

    const newProject = new Project({
      name,
      category,
      description,
      location,
      featured: featured === 'true',
      image: `/uploads/projects/${req.file.filename}`,
      createdAt: new Date()
    });

    await newProject.save();

    res.status(201).json({ success: true, data: newProject });
  } catch (error) {
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

/* -------------------- CLIENTS -------------------- */
router.get('/clients', async (req, res) => {
  try {
    const { type } = req.query;
    const filter = type ? { type: { $regex: new RegExp(type, 'i') } } : {};
    const clients = await Client.find(filter);
    res.json({ success: true, data: clients });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/* -------------------- PROJECT CATEGORIES -------------------- */
router.get('/categories', async (req, res) => {
  try {
    const categories = await Project.distinct('category');
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/* -------------------- CONTACT FORM -------------------- */
router.post('/contact', async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'Name, email, and message are required' });
  }

  try {
    // 1. Configure transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or another email service
      auth: {
        user: process.env.EMAIL_USER, // your email
        pass: process.env.EMAIL_PASS  // your email app password
      }
    });

    // 2. Email content
    const mailOptions = {
      from: email, // sender (user’s email)
      to: process.env.EMAIL_RECEIVER, // your email where you want to receive messages
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };

    // 3. Send email
    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: 'Thank you! Your message has been sent.' });

  } catch (error) {
    console.error('Email sending failed:', error);
    res.status(500).json({ success: false, error: 'Failed to send email' });
  }
});

/* -------------------- STATS / OVERVIEW -------------------- */
router.get('/stats', async (req, res) => {
  try {
    const companyInfo = await CompanyInfo.findOne({});
    const totalProjects = await Project.countDocuments({});
    const totalServices = await Service.countDocuments({});
    const totalClients = await Client.countDocuments({});
    const categories = await Project.distinct('category');

    res.json({
      success: true,
      data: {
        experience: companyInfo?.experience || 0,
        area: companyInfo?.area || 'N/A',
        turnover: companyInfo?.turnover || 'N/A',
        totalProjects,
        totalServices,
        totalClients,
        categories
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

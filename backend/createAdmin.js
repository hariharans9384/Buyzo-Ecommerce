const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');

    const email = 'admin@gmail.com';
    const password = 'Admin123';
    
    // Check if user exists
    let admin = await User.findOne({ email });
    if (admin) {
      console.log('Admin user already exists. Updating password and ensuring admin role...');
      admin.password = password;
      admin.role = 'admin';
      await admin.save();
      console.log('✅ Admin user updated successfully.');
    } else {
      console.log('Creating new admin user...');
      admin = new User({
        name: 'Admin',
        email,
        password,
        role: 'admin'
      });
      await admin.save();
      console.log('✅ Admin user created successfully.');
    }

    mongoose.disconnect();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error connecting to database:', err.message);
    process.exit(1);
  });

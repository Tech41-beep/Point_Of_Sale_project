const express = require('express');
const dotenv = require('dotenv');
const connectDb = require('./db');
const User = require('../model/user.model');
const bcrypt = require('bcrypt');

dotenv.config();
connectDb();

const seedUsers = async () => {
 try{
    const existingUser = await User.findOne({
        email: process.env.SUPER_EMAIL  
    })
    const hashedPassword= await bcrypt.hash(process.env.SUPER_PASSWORD, 12);
    if(!existingUser){
        console.log('Creating super user...');
        const uer = new User({ 
            name: process.env.SUPER_NAME,
            email: process.env.SUPER_EMAIL,
            password: hashedPassword,
            role: 'super_admin'
        });
        await uer.save();
        console.log('Super user created successfully');
    }
    else{
        console.log('Super user already exists');
    }
    process.exit(0);
 }catch(error){
    console.error('Error occurred while seeding users:', error);
    process.exit(1);
 }
}
seedUsers();

module.exports = seedUsers;

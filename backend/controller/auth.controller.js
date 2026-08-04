const User = require("../model/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const signup = async (req, res) => {
    try{
        const { name, email, password, role } = req.body;

        if(!name || !email || !password || !role){
            return res.status(400).json({
                success: false,
                message: 'Name, email, password and role are required',
            })
        }

        if(password.length < 8){
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long',
            })
        }
        const normalizedRole = role.toLowerCase();
        if(req.user.role === 'admin' && normalizedRole === 'super_admin'){
            return res.status(403).json({
                success: false,
                error: 'Forbidden. Admins cannot create super_admin users.',
            })
        }

        if(!['super_admin','admin', 'user', 'cashier'].includes(normalizedRole)){
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Role must be one of the following: super_admin, admin, user, cashier',
            })
        }

        const normalizedEmail = email.toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists',
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        if(normalizedRole === 'super_admin'){
            const existingSuperAdmin = await User.findOne({ role: 'super_admin' });
            if (existingSuperAdmin) {
                return res.status(400).json({
                    success: false,
                    message: 'A super admin already exists. Only one super admin is allowed.',
                });
            }
        }
        if(normalizedRole === 'admin'){
            const existingAdmin = await User.findOne({ role: 'admin' });
            if (existingAdmin) {
                return res.status(400).json({
                    success: false,
                    message: 'An admin already exists. Only one admin is allowed.',
                });
            }
        }
         const user = new User({
           name,
           email: normalizedEmail,
           password: passwordHash,
           role: normalizedRole,
        })
        const savedUser = await user.save();
        // create token
        const token = jwt.sign(
            {id: savedUser._id , role: savedUser.role},
             process.env.JWT_SECRET, 
             {expiresIn: process.env.JWT_LIFETIME});

              res.cookie('token', token, {
        httpOnly: true,
        secure: false, // set to true in production
        sameSite: 'strict',
        maxAge:   24 * 60 * 60 * 1000, // convert to milliseconds


    })
        return res.status(201).json({
            success: true,
            result:{
                user:{
                    id: savedUser._id,
                    name: savedUser.name,
                    email: savedUser.email,
                    role: savedUser.role,
                },
                token: token
            }
    }) 

    //set cookie 
   
    //create token



    }catch(error){
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}
        // 1. create token
        // 2. set cookie
        // 3. return response with user data and token
        // 4. handle errors
        // 5. export functions
        // 6. use async/await for asynchronous operations
        // 7. use try/catch for error handling
        // 8. validate input data
        // 9. check for existing user during signup
        // 10. hash password before saving to database
        // 11. compare hashed password during login
        // 12. use environment variables for secret and token lifetime
        // 13. set cookie options for security
        // 14. return appropriate HTTP status codes and messages
        // 15. structure response data in a consistent format
const login = async (req, res) => {
    try{
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required',
            });
        }
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(401).json({
                success: false,
                message: 'Invalid password',
            });
        }
      
        const token = jwt.sign(
            {id: user._id , role: user.role},
             process.env.JWT_SECRET,
              {expiresIn: process.env.JWT_LIFETIME});
              //set cookie 
              res.cookie('token', token, {
                httpOnly: true,
                secure: false, // set to true in production
                sameSite: 'strict',
                maxAge:   24 * 60 * 60 * 1000, // convert to milliseconds
                domain: 'localhost', // set your domain here
              })
        res.status(200).json({
            success: true,
            result: {
                user:{
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                token: token
                }
        })
    }catch(error){
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

        const logout = async (req, res) => {
            try{
                if(!req.user) {
                    return res.status(401).json({
                        success: false,
                        message: 'Unauthorized. No user is logged in.',
                    });
                }
                res.clearCookie('token');
                res.status(200).json({
                    success: true,
                    message: 'Logout successful',
                });
            }catch(error){
                res.status(500).json({
                    success: false,
                    message: error.message,
                })
            }
        }

        const getcurrentUser = async (req, res) => {
            try{
                res.status(200).json({
                    success: true,
                    result: req.user
                });
                console.log(req.user);
            }catch(error){
                res.status(500).json({
                    success: false,
                    message: error.message,
                })
            }
        }

module.exports = {
    signup,
    login,
    logout,
    getcurrentUser
}

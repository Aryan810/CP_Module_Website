const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role:{
        type: String,
        enum: ['admin', 'user', 'guest'],
        default: 'user',
        required: true
    },
    name: {
        type: String,
        required: false,
        default: ''
    },
    cfusername: {
        type: String,
        required: true,
        unique: true
    },
    ccusername: {
        type: String,
        required: false,
        unique: true
    },
    lcusername: {
        type: String,
        required: false,
        unique: true
    },
    acusername: {
        type: String,
        required: false,
        unique: true
    },
    loggedIn: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// these are nothing, just we are adding functions to the schema which we can use later to hash passwords and compare passwords

// Password hashing function
userSchema.statics.hashPassword = async function(password) {
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        throw new Error('Error hashing password: ' + error.message);
    }
};

// Password comparison function
userSchema.methods.comparePassword = async function(password) {
    try {
        const match = await bcrypt.compare(password, this.password);
        return match;
    } catch (error) {
        throw new Error('Error comparing password: ' + error.message);
    }
};

// Pre-save middleware to hash password before saving
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();
    
    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('User', userSchema);

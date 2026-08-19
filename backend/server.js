const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cred = require('./utilities/credentials');

// --- Mongoose Schemas ---
const studentSchema = new mongoose.Schema({
    rollNumber: { 
        type: Number, 
        unique: true, 
        required: function() { return this.role === 'student'; },
        sparse: true 
    },
    name: { type: String, required: true },
    password: { type: String, required: true },
    fine: { type: Number, default: 0 }, // This field remains, but our new logic won't use it for returns
    role: { type: String, default: 'student' }
});

studentSchema.index({ name: 1 }, { unique: true, partialFilterExpression: { role: 'admin' } });

const bookSchema = new mongoose.Schema({
    name: String,
    author: String,
    semester: Number,
    count: Number
});

const borrowSchema = new mongoose.Schema({
    idStudent: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    idBook: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    date: { type: Date, default: Date.now },
    deadline: { type: Date, default: () => new Date(+new Date() + 7 * 24 * 60 * 60 * 1000) } // 7-day deadline
});

const historySchema = new mongoose.Schema({
    idStudent: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    idBook: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    borrowId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
    issueDate: { type: Date, default: Date.now },
    returnDate: { type: Date },
    status: { type: String, enum: ['issued', 'returned'], default: 'issued' },
    penaltyPaid: { type: Number, default: 0 } // <-- ADDED: To track penalty
});


const Student = mongoose.model('Student', studentSchema);
const Book = mongoose.model('Book', bookSchema);
const Borrow = mongoose.model('Borrow', borrowSchema);
const History = mongoose.model('History', historySchema);

// --- Middleware ---
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).send('Access denied.');
    try {
        req.user = jwt.verify(token, 'your_jwt_secret_key');
        next();
    } catch (ex) {
        res.status(400).send('Invalid token.');
    }
};

const adminAuth = (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).send('Access denied.');
    next();
};

class LIBRARY {
    constructor(port, app) {
        this.port = port;
        this.app = app;
        this.app.use(express.json());
        mongoose.connect(cred.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
            .then(() => console.log('MongoDB Connected'))
            .catch(err => console.log(err));
    }

    routes() {
        // --- AUTH ROUTES ---
        this.app.post('/api/auth/register', async (req, res) => {
            try {
                const { name, password, role, rollNumber } = req.body;

                if (role === 'admin') {
                    const existingAdmin = await Student.findOne({ name: name, role: 'admin' });
                    if (existingAdmin) return res.status(400).send('Admin with this name already exists.');
                } else {
                    if (!rollNumber) return res.status(400).send('Roll number is required for students.');
                    const existingStudent = await Student.findOne({ rollNumber: rollNumber });
                    if (existingStudent) return res.status(400).send('Student with this roll number already exists.');
                }
                
                let newUser = new Student({
                    rollNumber: role === 'student' ? rollNumber : null,
                    name: name,
                    password: password,
                    role: role || 'student'
                });

                const salt = await bcrypt.genSalt(10);
                newUser.password = await bcrypt.hash(newUser.password, salt);
                await newUser.save();
                res.send("User registered successfully.");

            } catch (err) {
                console.error(err);
                res.status(500).send('Error registering user.');
            }
        });

        this.app.post('/api/auth/login', async (req, res) => {
            const { name, rollNumber, password } = req.body;
            const query = rollNumber ? { rollNumber: rollNumber } : { name: name, role: 'admin' };
            const student = await Student.findOne(query);

            if (!student) return res.status(400).send('Invalid credentials.');

            const validPassword = await bcrypt.compare(password, student.password);
            if (!validPassword) return res.status(400).send('Invalid credentials.');
            
            const token = jwt.sign({ _id: student._id, name: student.name, role: student.role, rollNumber: student.rollNumber }, 'your_jwt_secret_key');
            res.send(token);
        });
        
        // --- ADMIN-ONLY ROUTES ---
        this.app.get('/api/students', [auth, adminAuth], async (req, res) => {
            try {
                const studentCount = await Student.countDocuments({ role: 'student' });
                res.json({ count: studentCount });
            } catch (err) {
                console.error(err);
                res.status(500).send('Server Error');
            }
        });
        
        this.app.get('/api/all-students', [auth, adminAuth], async (req, res) => {
            try {
                const students = await Student.find({ role: 'student' }).select('name rollNumber');
                res.json(students);
            } catch (err) {
                console.error(err);
                res.status(500).send('Server Error');
            }
        });

        this.app.get('/api/student/:rollNumber', [auth, adminAuth], async (req, res) => {
            try {
                const student = await Student.findOne({ rollNumber: req.params.rollNumber });
                if (!student) {
                    return res.status(404).send('Student not found.');
                }
                res.send({ name: student.name });
            } catch (err) {
                res.status(500).send('Server error.');
            }
        });

        this.app.post('/api/borrow', [auth, adminAuth], async (req, res) => {
            try {
                const { studentId, bookId } = req.body;
                const student = await Student.findOne({ rollNumber: studentId });
                if (!student) return res.status(400).send('Student with that Roll Number not found.');
                
                const book = await Book.findById(bookId);
                if (!book || book.count < 1) return res.status(400).send('Book is not available.');
                
                const newBorrow = new Borrow({ idStudent: student._id, idBook: bookId });
                await newBorrow.save();
                
                await Book.findByIdAndUpdate(bookId, { $inc: { count: -1 } });

                const history = new History({ 
                    borrowId: newBorrow._id,
                    idStudent: student._id, 
                    idBook: bookId, 
                    status: 'issued',
                    issueDate: newBorrow.date 
                });
                await history.save();
                
                res.send("Book issued successfully.");
            } catch (err) { 
                console.log(err);
                res.status(500).send("Server error."); 
            }
        });
        
        // --- THIS IS THE UPDATED RETURN ROUTE ---
        this.app.post('/api/return', [auth, adminAuth], async (req, res) => {
            // Get 'paymentConfirmed' flag from the request body
            const { borrowId, paymentConfirmed } = req.body; 
            
            const borrow = await Borrow.findById(borrowId);
            if (!borrow) return res.status(404).send("Borrow record not found");

            const d1 = new Date(borrow.deadline);
            const d2 = new Date();
            let penalty = 0;
            let daysDiff = 0;

            if (d2 > d1) {
                const timeDiff = d2 - d1;
                daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                penalty = daysDiff * 10; // Your 10 rupees per day logic
            }
            
            // --- NEW PENALTY LOGIC ---
            // If there is a penalty AND payment has NOT been confirmed
            if (penalty > 0 && !paymentConfirmed) {
                // Return a 402 "Payment Required" status
                // This stops the function and sends the penalty info to the frontend
                return res.status(402).send({
                    message: `Penalty due: ₹${penalty} for ${daysDiff} days late.`,
                    penalty: penalty,
                    daysLate: daysDiff
                });
            }
            // --- END NEW PENALTY LOGIC ---
            
            // If there is no penalty, OR if payment has been confirmed, proceed:
            try {
                await Book.findByIdAndUpdate(borrow.idBook, { $inc: { count: 1 } });
                await Borrow.findByIdAndRemove(borrowId);

                // Update the history record, now including the penalty that was paid
                await History.findOneAndUpdate(
                    { borrowId: borrow._id },
                    { 
                        status: 'returned', 
                        returnDate: new Date(),
                        penaltyPaid: penalty // Record the penalty amount
                    }
                );
                
                // Send a success message
                res.send(`Book returned successfully. ${penalty > 0 ? `Penalty of ₹${penalty} collected.` : ''}`);
            
            } catch (err) {
                console.error(err);
                res.status(500).send('Server error during return process.');
            }
        });
        
        this.app.get('/api/all-borrows', [auth, adminAuth], async (req, res) => {
            const borrows = await Borrow.find().populate('idBook').populate('idStudent');
            // We should also calculate and send the penalty here
            const borrowsWithPenalty = borrows.map(borrow => {
                const d1 = new Date(borrow.deadline);
                const d2 = new Date();
                let penalty = 0;
                let daysLate = 0;
                if (d2 > d1) {
                    const timeDiff = d2 - d1;
                    daysLate = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                    penalty = daysLate * 10;
                }
                // Return a new object with all borrow data + penalty
                return {
                    ...borrow.toObject(),
                    penalty,
                    daysLate
                };
            });
            res.send(borrowsWithPenalty);
        });

        this.app.get('/api/history', [auth, adminAuth], async (req, res) => {
            try {
                // Added penaltyPaid to the selection
                const history = await History.find().populate('idBook', 'name').populate('idStudent', 'name rollNumber').sort({ issueDate: -1 });
                res.json(history);
            } catch (err) {
                console.error(err);
                res.status(500).send('Server Error');
            }
        });

        this.app.delete('/api/history', [auth, adminAuth], async (req, res) => {
            try {
                await History.deleteMany({});
                res.send('Transaction history cleared successfully.');
            } catch (err) {
                console.error(err);
                res.status(500).send('Server Error');
            }
        });

        // --- GENERAL & STUDENT ROUTES ---
        this.app.get('/api/getBooks', async (req, res) => {
            const books = await Book.find();
            res.send(books);
        });

        this.app.get('/api/getBooks/semester/:sem', async (req, res) => {
            const books = await Book.find({ semester: req.params.sem });
            res.send(books);
        });

        this.app.get('/api/my-books', auth, async (req, res) => {
            const borrows = await Borrow.find({ idStudent: req.user._id }).populate('idBook');
            // Also calculate penalty for student view
            const borrowsWithPenalty = borrows.map(borrow => {
                const d1 = new Date(borrow.deadline);
                const d2 = new Date();
                let penalty = 0;
                let daysLate = 0;
                if (d2 > d1) {
                    const timeDiff = d2 - d1;
                    daysLate = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                    penalty = daysLate * 10;
                }
                return {
                    ...borrow.toObject(),
                    penalty,
                    daysLate
                };
            });
            res.send(borrowsWithPenalty);
        });
        
        this.app.get('/api/my-history', auth, async (req, res) => {
            try {
                const studentHistory = await History.find({ idStudent: req.user._id })
                    .populate('idBook', 'name')
                    .sort({ issueDate: -1 });
                res.json(studentHistory);
            } catch (err) {
                console.error(err);
                res.status(500).send('Server Error');
            }
        });

        this.app.delete('/api/my-history', auth, async (req, res) => {
            try {
                await History.deleteMany({ idStudent: req.user._id });
                res.send('Your transaction history has been cleared.');
            } catch (err) {
                console.error(err);
                res.status(500).send('Server Error');
            }
        });
    }

    listen() {
        this.app.listen(this.port, (err) => {
            if (err) console.log(err);
            else console.log(`Server Started On ${this.port}`);
        });
    }
}

let library = new LIBRARY(3001, express());
library.routes();
library.listen();
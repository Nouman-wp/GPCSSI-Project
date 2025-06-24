// Step 1: Initial Setup - app.js (Entry Point)

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const multer = require('multer');

const caseRoutes = require('./routes/cases');
const walletRoutes = require('./routes/wallets');

require('dotenv').config();

const app = express();

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// App configuration
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Session and Flash
app.use(session({
  secret: 'chainwatchsecret',
  resave: false,
  saveUninitialized: false
}));
app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Routes
app.use('/', caseRoutes);
app.use('/wallets', walletRoutes);

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`ChainWatch server running on port ${PORT}`);
});

// Step 2: MongoDB Models - models/Case.js and models/Wallet.js

// models/Case.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const caseSchema = new Schema({
  title: String,
  description: String,
  status: {
    type: String,
    enum: ['Open', 'Under Investigation', 'Closed'],
    default: 'Open'
  },
  officer: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Case', caseSchema);

// models/Wallet.js
const walletSchema = new Schema({
  caseId: {
    type: Schema.Types.ObjectId,
    ref: 'Case'
  },
  address: String,
  label: {
    type: String,
    enum: ['Victim', 'Suspect', 'Funnel Wallet', 'Unknown'],
    default: 'Unknown'
  },
  notes: String,
  txHistory: Array,
  tokens: Array,
  counterparties: Array,
  exchangeInteractions: Array,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Wallet', walletSchema);

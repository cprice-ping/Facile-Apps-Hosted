const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const config = require('./config');

const app = express();

// Security headers
app.use(helmet());
// HTTP request logging
app.use(morgan('combined'));
// Enable CORS with configured origin
app.use(cors({ origin: config.corsOrigin }));
app.use(express.static('public'));
app.set("view engine", "pug");

app.use(express.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// const path = require('path'); (unused)

// Mount template routes
app.use(require('./routes/templates'));

// Mount API routes (token, proxy, risk evaluation)
app.use(require('./routes/api'));

// Mount PF Agentless routes (device pickup/dropoff)
app.use(require('./routes/pfAdapter'));
// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// Server section
const listener = app.listen(config.port, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});

// PF agentless adapter logic moved to routes/pfAdapter.js and services/pfAdapter.js
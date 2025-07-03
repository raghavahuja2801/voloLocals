// index.js
const express    = require('express');
const app        = express();
const PORT       = process.env.PORT || 3000;
const leadRoutes = require('./routes/leads');
const errorHandler = require('./middleware/errorHandling');

app.use(express.json());

// mount your lead‐generation routes
app.use('/api/leads', leadRoutes);

app.use(errorHandler);

app.listen(PORT, () =>
  console.log(`🚀 Server listening on http://localhost:${PORT}`)
);

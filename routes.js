// TODO, can this file be deleted?

const express = require('express');
const router = express.Router();

// Route to fetch all users
router.get('/', (req, res) => {
  res.send('Hello World!');
});

module.exports = router;
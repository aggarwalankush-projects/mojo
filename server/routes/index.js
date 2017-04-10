const express = require('express');
const testController = require('../controllers/test');
const router = express.Router();
const testRouter = express.Router();

/**
 * Test route
 */
router.use('/test', testRouter);
testRouter.route('/')
  .get(testController.test);

module.exports = router;

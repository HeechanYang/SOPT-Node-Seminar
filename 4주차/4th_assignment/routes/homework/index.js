var express = require('express');
var router = express.Router();

//현재 위치 경로: localhost:3000/
router.use('/board', require('./board/index'))
router.use('/', require('./user'))

module.exports = router;
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req: any, res: any, next: any) {
  res.send('Hello, World!');
});

/* GET timeline */
router.get('/timeline', function(req: any, res: any, next: any) {
  res.sendFile(__dirname + "/timeline.json");
})

module.exports = router;

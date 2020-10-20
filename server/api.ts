var express = require('express');
var router = express.Router();

import resultsFor from './getSearchResults'

/* GET home page. */
router.get('/', function(req: any, res: any, next: any) {
  res.send('Hello, World!');
});

/* GET timeline */
router.get('/timeline', function(req: any, res: any, next: any) {
  res.sendFile(__dirname + "/timeline.json");
})

router.get('/search/:str', function(req: any, res: any, next: any) {
  res.json(resultsFor(req.params.str))
})

module.exports = router;

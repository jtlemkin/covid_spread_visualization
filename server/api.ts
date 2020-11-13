var express = require('express');
var router = express.Router();

import resultsFor from './getSearchResults'
import placesFor from './getPlaces'

/* GET home page. */
router.get('/', function(req: any, res: any, next: any) {
  res.send('Hello, World!');
});

/* GET timeline */
router.get('/timeline', function(req: any, res: any, next: any) {
  res.sendFile(__dirname + "/timeline.json");
})

router.get('/timeline/contact_tracing', function(req: any, res: any, next: any) {
  res.sendFile(__dirname + "/timeline_contactTracing.json");
})

router.get('/timeline/mandatory_mask', function(req: any, res: any, next: any) {
  res.sendFile(__dirname + "/timeline_mandatoryMasking.json");
})

router.get('/timeline/mask', function(req: any, res: any, next: any) {
  res.sendFile(__dirname + "/timeline_mask.json");
})

router.get('/timeline/social_distance', function(req: any, res: any, next: any) {
  res.sendFile(__dirname + "/timeline_socialDistance.json");
})

router.get('/timeline/strict_social_distance', function(req: any, res: any, next: any) {
  res.sendFile(__dirname + "/timeline_strictSocialDistance.json");
})

router.get('/search/:str', function(req: any, res: any, next: any) {
  res.json(resultsFor(req.params.str))
})

router.get('/cities/:fips', function(req: any, res: any, next: any) {
  res.json(placesFor(req.params.fips))
})

module.exports = router;

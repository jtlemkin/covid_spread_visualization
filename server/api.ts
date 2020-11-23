var express = require('express');
var router = express.Router();

import resultsFor from './getSearchResults'
import placesFor from './getPlaces'

/* GET home page. */
router.get('/', function(req: any, res: any, next: any) {
  res.sendFile(__dirname + '/client/index.html');
});

/* GET timeline */
router.get('/timeline/cases', function(req: any, res: any, next: any) {
  console.log("hit!")
  res.sendFile(__dirname + "/timeline_cases.json");
})

router.get('/timeline/contact_tracing', function(req: any, res: any, next: any) {
  res.sendFile(__dirname + "/timeline_contactTracing.json");
})

router.get('/timeline/mandatory_mask', function(req: any, res: any, next: any) {
  res.sendFile(__dirname + "/timeline_mandatoryMasking.json");
})

router.get('/timeline/strict_social_distance_plus_mask', function(req: any, res: any, next: any) {
  res.sendFile(__dirname + "/timeline_strictSocialDistancePlusMask.json");
})

router.get('/timeline/social_distance_plus_mask', function(req: any, res: any, next: any) {
  res.sendFile(__dirname + "/timeline_socialDistancePlusMask.json");
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

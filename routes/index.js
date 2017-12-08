var express = require('express');
var router = express.Router();
const Type = require('../models/type');
const Class = require('../models/class');

var typesAll = []
var classesAll = []
Class.find({}, function(err, classes) {
  classesAll = classes;
});
Type.find({}, function(err, types) {
  typesAll = types;
});
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {classes: classesAll});
});


module.exports = router;

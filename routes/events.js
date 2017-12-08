const express = require('express');
const Event = require('../models/event');
const Type = require('../models/type');
const Class = require('../models/class');
const User = require('../models/user');
const catchErrors = require('../lib/async-error');
var fs = require('fs');

const router = express.Router();
var typesAll = []
var classesAll = []
Class.find({}, function(err, classes) {
  classesAll = classes;
});
Type.find({}, function(err, types) {
  typesAll = types;
});

// 동일한 코드가 users.js에도 있습니다. 이것은 나중에 수정합시다.
function needAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash('danger', 'Please signin first.');
    res.redirect('/signin');
  }
}

/* GET events listing. */
router.get('/', catchErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  var query = {};
  const title = req.query.title;
  const place = req.query.place;
  const className = req.query.className;
  console.log(title);
  console.log(place);
  console.log(className);
  var typesAll = await Type.find({});
  var classesAll = await Class.find({});
  if(title) query.title = new RegExp('^.*'+title+'.*$', "i");
  if(place) query.place = new RegExp('^.*'+place+'.*$', "i");
  if(className) query.class = await Class.find({name: className});

  console.log(query);
  const events = await Event.paginate(query, {
    sort: {createdAt: -1},
    populate: 'author',
    page: page, limit: limit
  });
  res.render('events/index', {events: events, classes: classesAll, query: req.query});
}));

router.get('/new', needAuth, (req, res, next) => {
  res.render('events/new', {event: {}, types: typesAll, classes: classesAll});
});

router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
  const event = await Event.findById(req.params.id);
  res.render('events/edit', {event: event, types: typesAll, classes: classesAll});
}));

router.get('/:id', catchErrors(async (req, res, next) => {
  const event = await Event.findById(req.params.id).populate('author');
  var guests = []
  for(var i=0; i<event.guest.length; i++){
    var guest = await User.findById(event.guest[i]);
    guests.push(guest);
  }
  var query = {event: event, guests: guests}
  var type = await Type.findById(event.type);
  var classObj = await Class.findById(event.class);
  if(type)
    query.typeName = type.name;
  if(classObj)
    query.className = classObj.name;
  res.render('events/show', query);
}));

router.put('/:id', catchErrors(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    req.flash('danger', 'Not exist event');
    return res.redirect('back');
  }

  event.title = req.query.title ? req.query.title : event.title;
  event.place = req.query.place ? req.query.place : event.place;
  event.start_date = req.query.start_date ? req.query.start_date : event.start_date;
  event.end_date = req.query.end_date ? req.query.end_date : event.end_date;
  event.content = req.query.content ? req.query.content : event.content;
  event.group_name = req.query.group_name ? req.query.group_name : event.group_name;
  event.group_desc = req.query.group_desc ? req.query.group_desc : event.group_desc;
  event.price = req.query.price ? req.query.price : event.price;
  event.type = req.query.type ? await Type.findById(req.query.type) : event.type;
  event.class = req.query.class ? await Class.findById(req.query.class) : event.class;

  await event.save();
  req.flash('success', 'Successfully updated');
  res.redirect('/events');
}));

router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
  await Event.findOneAndRemove({_id: req.params.id});
  req.flash('success', 'Successfully deleted');
  res.redirect('/events');
}));

router.post('/', needAuth, catchErrors(async (req, res, next) => {
  // const newItem = new Item();
  var images = []
  for(var i=0; i<req.files.length; i++){
    var f = req.files[i];
    images.push({
      data: fs.readFileSync(f.path),
      contentType: f.mimetype
    });
  }
  const user = req.user;
  const event = new Event({
    author: user._id,
    title: req.body.title,
    place: req.body.place,
    start_date: req.body.start_date,
    end_date: req.body.end_date,
    content: req.body.content,
    group_name: req.body.group_name,
    group_desc: req.body.group_desc,
    price: req.body.price,
    images: images,
    type: await Type.findById(req.body.type),
    class: await Class.findById(req.body.class)
  });
  await event.save();
  req.flash('success', 'Successfully posted');
  res.redirect('/events');
}));

router.post('/:id/apply', needAuth, catchErrors(async (req, res, next) => {
  const user = req.user;
  const event = await Event.findById(req.params.id);

  if (!event) {
    req.flash('danger', 'Not exist event');
    return res.redirect('back');
  }
  event.guest.push(user)
  await event.save();

  req.flash('success', 'Successfully applied');
  res.redirect(`/events/${req.params.id}`);
}));



module.exports = router;

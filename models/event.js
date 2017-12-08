const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;
const multer = require('multer');

var schema = new Schema({
  author: {type: Schema.Types.ObjectId, ref: 'User' },
  title: {type: String, trim: true, required: true},
  place: {type: String, trim: true, required: true},
  start_date: {type: Date, required: true},
  end_date: {type: Date, required: true},
  content: {type: String, trim: true, required: true},
  group_name: {type: String, trim: true, required: true},
  group_desc: {type: String, trim: true, required: true},
  type: {type: Schema.Types.ObjectId, ref: 'Type' },
  class: {type: Schema.Types.ObjectId, ref: 'Class' },
  price: {type: Number, default: 0},
  max_user: {type: Number, default: 10},
  guest: [{type: Schema.Types.ObjectId, ref: 'User'}],
  images: [{ data: Buffer, contentType: String }]
}, {
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});
schema.plugin(mongoosePaginate);
var Event = mongoose.model('Event', schema);

module.exports = Event;

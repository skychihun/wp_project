const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

var schema = new Schema({
  name: {type: String, trim: true, unique: true, required: true}
}, {
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});
schema.plugin(mongoosePaginate);
var Class = mongoose.model('Class', schema);

module.exports = Class;

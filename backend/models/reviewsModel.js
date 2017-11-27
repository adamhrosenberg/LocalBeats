var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

/**
 * Review Schema
 */
var ReviewSchema = new Schema({
    toUID           : {type: String, required: true},
    fromUID         : {type: String, required: true},
    title           : {type: String, required: true},
    text            : {type: String, required: true},
    rating          : {type: Number}
}, {strict: true}, {versionKey: false});

mongoose.model('Review', ReviewSchema);

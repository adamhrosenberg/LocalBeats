var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

/**
 * Bookings Schema
 */
var BookingsSchema = new Schema({
    bookingType     : {type: String, required: true, lowercase: true}, // in {"arist-apply", "host-request"}
    hostUID         : {type: Schema.Types.ObjectId, ref: 'User' },
    performerUID    : {type: Schema.Types.ObjectId, ref: 'User' },
    eventEID        : {type: String, required: true},
    approved        : {type: Boolean, default: false}, // Approved is true when bookingType=artist-apply when a host has accepted an application from an artist. When bookingType=host-request it means the artist has agreed to the request from the host. 
    completed       : {type: Boolean, default: false} // Has the event had the 2 factor auth go through?
}, {strict: true});

mongoose.model('Bookings', BookingsSchema);

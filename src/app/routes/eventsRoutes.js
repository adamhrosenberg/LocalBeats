'use strict';

module.exports = function(app) {
	var eventHandlers = require('../controllers/eventsController.js');
	// var tokenVerificationHandler = require('../controllers/tokenVerificationController.js');

	// Users routes
	app.route('/api/events');
		// .get(userHandlers.listAllUsers);
		// .post(userHandlers.loginRequired, events.hostEvent);   // TODO: Host event will go here

	app.route('/api/events/:eid')
        .get(eventHandlers.getEventByID)
        .put(eventHandlers.updateEventByID)
        .delete(eventHandlers.deleteEventByID);
    
    app.route('/api/events/create')
        .post(eventHandlers.createEvent);
};

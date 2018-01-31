'use strict';

module.exports = function(app) {
	var messageHandlers = require('../controllers/messageController.js');
    
    // Message routes
	app.route('/api/messages/from/:uid/to/:uid')        // SAME AS (to, from) == (from, to)
		.get(messageHandlers.getAllFromToMessages);     // Get all messages from a user to a user

	app.route('/api/messages/')
		.get(messageHandlers.getAllMessages)
		.post(messageHandlers.saveMessage)               // save message to DB
        .delete(messageHandlers.clearMessagesDB);       // remove all messages from DB
    
    app.route('/api/messages/:uid')
        .delete(messageHandlers.removeAllConversationsWithAUser);
};

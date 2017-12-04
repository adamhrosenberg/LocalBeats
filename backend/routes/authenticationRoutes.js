'use strict';

module.exports = function(app) {
    
    /**
     * Authetication - the act of logging a user in
     */
    var tokenVerificationHandler = require('../controllers/tokenVerificationController.js');
	var autheticationHandler = require('../controllers/authenticationController.js');

	app.route('/api/auth/register')
		.post(autheticationHandler.register);

	app.route('/api/auth/authenticate')
		.post(autheticationHandler.signIn);

	app.route('/api/auth/passwordChange/:uid')
		.put(tokenVerificationHandler.verifyToken, autheticationHandler.changePassword);

	app.route('/api/auth/logout')
		.get(autheticationHandler.logout);

	/**
	 * Authorization - the act of verifying the access rights of a user to 
	 * interact with a resource. 
     * 
     * Can't be accessed without valid JWT.
	 * Need to pass JWT token in x-access-token header in the GET request
	 */
	app.route('/api/auth/whoami')
		.get(tokenVerificationHandler.verifyToken, autheticationHandler.whoAmI);
};
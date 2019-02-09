module.exports = {

	listen: function(port) {

		var express = require('express');
		var cors = require('cors');

		var app = express();
		app.use(cors());

		app.listen(port, function() {
			console.log('Listening at REST port ' +port+'.');
		});

	}

}

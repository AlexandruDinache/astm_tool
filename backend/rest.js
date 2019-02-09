module.exports = {

	expressApp: '',

	listen: function(express, cors, port) {

		this.expressApp = express();
		this.expressApp.use(cors());

		this.expressApp.listen(port, function() {
			console.log('Listening at REST port ' +port+'.');
		});

	}

}

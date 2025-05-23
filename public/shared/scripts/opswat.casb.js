function OpswatCASB () {
	this.options = {
		timeout: 10000,
		serverPort: 11369,
		serverAddress: 'eapi.opswatgears.com',
		apiUrl: '/opswat/devinfo',
		callback: undefined,
		data: undefined
	};
	
}
OpswatCASB.prototype = {
	version: '1.0',
	jsonp: function (options) {
		//Replace properties from user input:
		for ( var i in options ) {
			this.options[i] = options[i];
		}
		this._callJsonp();
	},
	_callJsonp: function () {
		var opswatCASB = this;
		$.ajax({
			url: 'https://' + opswatCASB.options.serverAddress + ':' + opswatCASB.options.serverPort + opswatCASB.options.apiUrl,
			dataType: "jsonp",
			data: JSON.stringify(opswatCASB.options.data),
			timeout: opswatCASB.options.timeout,
		    success: function(data) {
		         opswatCASB._handleSuccessResponse(data);
		    },
		    error: function(data){
		    	//Timeout request:
		    	//console.log( 'data: ', data )
  				opswatCASB._handleErrorResponse(data);
			}
		});
	},
	_handleSuccessResponse: function (data) {
		if(this.options.callback != undefined)
		{
			this.options.callback(data);
		}
	},
	_handleErrorResponse: function (data) {
		if(this.options.callback != undefined)
		{
			var jsonResponse = {code: -31,
								description: 'Not found'};
			if(data.statusText == "timeout")
				jsonResponse = {code: -30,
								description: 'Timeout'};
			this.options.callback(jsonResponse);
		}
	}
}

/**
* A class for working with a HTTP API.
* @typedef
*/
export const API = {
	/**
	* Requests all images from the server.
	* @return Promise
	*/
	getAllImages: async function() {
		return this.get("images");
	},

	/**
	* Requests images by the conditions specified.
	* @param string url URL of web page with the images to be downloaded.
	* @param minWidth Minimum width of an image to be downloaded.
	* @param minHeight Minimum height of an image to be downloaded.
	* @return Promise
	*/
	getImages: async function(url: string, minWidth: int, minHeight: int){
		return this.get("images", {
	    	url,
	    	"min-width": minWidth,
	    	"min-height": minHeight,
	    });
	},

	/**
	* Makes an http(s) request to the API.
	* @param string path API route path.
	* @param object params Request query string parameters.
	* @return Promise
	*/
	get: async function(path: string, params: object = {}) {
	    const apiUrl = ENV.API_HOST + `/${path}`;
	    const paramsStr = new URLSearchParams(params);
	    return await fetch(`${apiUrl}?${paramsStr}`, {
	      method: "GET"
	    })
	    .then(response => response.json())
		.then(data => data.images)
		.catch(error => {
			const msg = `
				An unexpected error occured !
				Please try again later
			`;
		  	alert(msg);
		});
	},
}


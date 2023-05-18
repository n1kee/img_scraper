
export const API = {
	getAllImages: async function() {
		return this.get("images");
	},
	getImages: async function(url: string, minWidth: int, minHeight: int){
		return this.get("images", {
	    	url,
	    	"min-width": minWidth,
	    	"min-height": minHeight,
	    });
	},
	get: async function(path: string, params: object = {}) {
	    const apiUrl = ENV.API_HOST + `/${path}`;
	    const paramsStr = new URLSearchParams(params);
	    return await fetch(`${apiUrl}?${paramsStr}`, {
	      method: "GET",
	      mode: "cors"
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


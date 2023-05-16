
export const API = {
	getImages: async (url: string, minWidth: int, minHeight: int) => {
	    const apiUrl = ENV.API_HOST + "/fetch-images";
	    const params = new URLSearchParams({
	    	url,
	    	t: + new Date, 
	    	"min-width": minWidth,
	    	"min-height": minHeight,
	    });
	    return await fetch(`${apiUrl}?${params}`, {
	      method: "GET",
	      mode: "cors"
	    })
	    .then(response => response.json())
		.then(data => data.images);
	},
}



export const API = {
	getImages: async (url: string, maxWidth: int, maxHeight: int) => {
	    const apiUrl = ENV.API_HOST + "/fetch-images";
	    const params = new URLSearchParams({
	    	url,
	    	"max-width": maxWidth,
	    	"max-height": maxHeight
	    });
	    return await fetch(`${apiUrl}?${params}`, {
	      method: "GET",
	      mode: "cors"
	    })
	    .then(response => response.json())
		.then(data => data.images);
	},
}


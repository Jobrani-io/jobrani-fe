export const jsonReq = async (url: string, init?: RequestInit) => {
	const response = await fetch(url, init);
	return response.json();
};

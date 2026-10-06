const SEARCH_URL = "https://en.wikipedia.org/w/rest.php/v1/search/page";
const SUMMARY_URL = "https://en.wikipedia.org/api/rest_v1/page/summary/";

export async function searchWikipedia(query) {
    if(!query.trim()){
        return [];
    }

    const response = await fetch(
        `${SEARCH_URL}?q=${encodeURIComponent(query)}&limit=8`
    );

    if(!response.ok){
        throw new Error("Wikipedia search failed.");
    }

    const data = await response.json();

    return data.pages || [];
}

export async function getWikipediaSummary(title) {
    const response = await fetch(
        `${SUMMARY_URL}${encodeURIComponent(title)}`
    );

    if(!response.ok){
        throw new Error("Wikipedia article could not be loaded.");
    }

    return await response.json();
}
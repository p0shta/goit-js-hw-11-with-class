import axios from 'axios';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '27312740-8863e8bb5d8c57be57511899b';

export default async function fetchImages(searchQuery, pageValue) {
  const searchQueryString = makeLongQueryString(searchQuery);

  const url = `${BASE_URL}?key=${API_KEY}&q=${searchQueryString}&image_type=photo&orientation=horizontal&safesearch=true&page=${pageValue}&per_page=40`;
  const response = await axios(url);

  return response.data.hits;
}

function makeLongQueryString(searchQuery) {
  const queryString = searchQuery.split(' ');
  if (queryString.length > 1) {
    return queryString.join('+');
  }

  return queryString.join('');
}

import axios from 'axios';

async function main() {
  const url = 'https://api.musicnerd.xyz/api/searchArtists/batch/';
  const payload = {"query": {"artists": ['A$AP Rocky', 'k/da']} };
  // const payload = {query: 'a$ap rocky'};
  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 15000
    });

    console.log(JSON.stringify(response.data, null, 2));
    process.exit(0);
  } catch (error) {
    if (error.response) {
      console.error('Request failed:', error.response.status, error.response.statusText);
      try {
        console.error(JSON.stringify(error.response.data, null, 2));
      } catch (_) {
        console.error(error.response.data);
      }
    } else {
      console.error('Request error:', error.message);
    }
    process.exit(1);
  }
}

main();


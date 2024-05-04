const axios = require('axios');

const options = {
  method: 'GET',
  url: 'https://us-doctors-and-medical-professionals.p.rapidapi.com/search_npi',
  params: {npi: '1033112214'},
  headers: {
    'X-RapidAPI-Key': 'a534c10b0fmsh6a1b58d7f299d91p124b88jsn096bf0e51d7b',
    'X-RapidAPI-Host': 'us-doctors-and-medical-professionals.p.rapidapi.com'
  }
};

async function medapi() {
  try {
    const response = await axios.request(options);
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}

medapi();
const axios = require('axios');
require('dotenv').config();

async function testAlpha() {
    try {

        const response = await axios.get(
            'https://www.alphavantage.co/query',
            {
                params: {
                    function: 'OVERVIEW',
                    symbol: 'INFY',
                    apikey: process.env.ALPHA_VANTAGE_KEY,
                }
            }
        );

        console.log(response.data);

    } catch (error) {

        console.log(error.response?.data || error.message);
    }
}

testAlpha();
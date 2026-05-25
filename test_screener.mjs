import axios from 'axios';

async function testScreener() {
    try {
        const response = await axios.post('https://final-year-project-rho-eight.vercel.app/api/screener/run', {
            filters: { minMarketCap: 500000000000 }
        });
        console.log("Success! Results length:", response.data?.data?.results?.length);
        console.log("First result:", response.data?.data?.results?.[0]);
    } catch (err) {
        console.error("API error:", err.response?.data || err.message);
    }
}

testScreener();

const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const app = express();
const PORT = 3000;

// Get your free API key from https://serpapi.com/
const SERPAPI_KEY = '62959c25e93c1ee97a702659afefcb40b36fff7480490f956ce2db5be9c8e829';

app.get('/api/gemini-food', async (req, res) => {
    const dish = req.query.dish;
    if (!dish) return res.status(400).json({ error: 'No dish provided' });

    let imageUrl = '';
    let description = '';

    // 1. Get image from Google Images via SerpAPI
    try {
        const serpUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(dish + ' food')}&tbm=isch&ijn=0&api_key=${SERPAPI_KEY}`;
        const serpRes = await fetch(serpUrl);
        const serpData = await serpRes.json();
        imageUrl = serpData.images_results?.[0]?.original || '';
    } catch (e) {
        console.error('SerpAPI error:', e);
    }

    // 2. Get description from Wikipedia
    try {
        const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(dish)}`;
        const wikiRes = await fetch(wikiUrl);
        const wikiData = await wikiRes.json();
        if (wikiData.extract) {
            // Get first two sentences
            description = wikiData.extract.split('. ').slice(0,2).join('. ') + '.';
        }
    } catch (e) {
        console.error('Wikipedia error:', e);
    }

    res.json({
        imageUrl,
        description: description || 'No description available.'
    });
});

app.use(express.static('.')); // Serve your frontend

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

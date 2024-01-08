const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const { CohereClient } = require('cohere-ai');  // Importing CohereClient
const mongoose = require('mongoose');
const SaveSummary = require('../backend/model');
require('dotenv').config();

const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY,  // Using the API key from environment variables
});
const mongo_uri = process.env.MONGO_URI 

app.use(cors());
app.use(bodyParser.json());

// Connecting to MongoDB
mongoose.connect(mongo_uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then( () => console.log('MongoDB connected successfully') )
.catch( err => console.log(err) );

app.post('/summarize', async (req, res) => {
    try {
        const { title, text } = req.body;

        // Using the Cohere client to make the API call
        const response = await cohere.summarize({
            text: text || '',
            length: 'medium',
            format: 'paragraph',
            model: 'summarize-xlarge',
            additional_command: '',
            temperature: 0.3,
        });

        // Saving the summary to MongoDB
        const newSummary = new SaveSummary({
            title,
            summary: response.summary,
        });

        newSummary.save()
        .then( () => console.log('Summary saved to MongoDB') )
        .catch( err => console.log(err) );

        // Sending the summary back to the frontend
        res.send(response.summary);
        console.log('Summarized text successfully')
    } catch (error) {
        console.error('Error summarizing text:', error);
        res.status(500).send('An error occurred while summarizing the text.');
    }
});

app.get('/summaries', async(req,res) => {
    try{
        const summaries = await SaveSummary.find({}, 'title summary');

        res.json(summaries);
        console.log('Sent summaries to frontend');
    }
    catch(error){
        console.log('Error fetching summaries:', error)
        res.status(500).send('An error occured while fetching summaries')
    }
})

app.get('/', (res, req) => {
    res.status(200).send('Working well');
})
const port = 5000;
app.listen(port, () => {
    console.log('Running on port ' + port);
});

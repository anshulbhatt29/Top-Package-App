// Backend code
// Import necessary modules and setup Express app
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection URI
const uri = "mongodb+srv://anshul:Password@cluster0.sdfuc3n.mongodb.net/?retryWrites=true&w=majority";

// Connect to MongoDB
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Define the schema
const GithubDependenciesSchema = new mongoose.Schema({
    Name: String,
    Count: Number
});

const GithubRepositoriesSchema = new mongoose.Schema({
    Id: String
});

// Create a model
const GithubDependencies = mongoose.model('GithubDependencies', GithubDependenciesSchema);

const GithubRepositories = mongoose.model('GithubRepositories', GithubRepositoriesSchema);

// Define the endpoint to handle POST requests from the frontend
app.post('/import-package-json', async (req, res) => {
    try {
        const { packageJson } = req.body;

        for (let dependency in packageJson.dependencies) {
            let existingDependency = await GithubDependencies.findOne({ Name: dependency });
            if (existingDependency) {
                existingDependency.Count++;
                await existingDependency.save();
            } else {
                const newDependency = new GithubDependencies({
                    Name: dependency,
                    Count: 1
                });
                await newDependency.save();//model.save...
            }
        }

        for (let devDependency in packageJson.devDependencies) {
            let existingDependency = await GithubDependencies.findOne({ Name: devDependency });
            if (existingDependency) {
                existingDependency.Count++;
                await existingDependency.save();
            } else {
                const newDependency = new GithubDependencies({
                    Name: devDependency,
                    Count: 1
                });
                await newDependency.save();
            }
        }

        res.status(200).json({ message: 'Package JSON imported successfully' });
    } catch (error) {
        console.error('Error importing package JSON:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/top-ten-dependencies', async (req, res) => {
    try {
        const topDependencies = await GithubDependencies.find().sort({ Count: -1 }).limit(10);
        res.json(topDependencies);
    } catch (error) {
        console.error('Error fetching top ten dependencies:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/all-ids', async (req, res) => {
    try {
        const allDependencies = await GithubRepositories.find();
        res.json(allDependencies);
    } catch (error) {
        console.error('Error fetching  dependencies:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/check-id/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const repository = await GithubRepositories.findOne({ Id: id });
        if (repository) {
            res.json({ exists: true });
        } else {
            res.json({ exists: false });
        }
    } catch (error) {
        console.error('Error checking ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to save ID
app.post('/save-id', async (req, res) => {
    try {
        const { id } = req.body;
        const repository = new GithubRepositories({ Id: id });
        await repository.save();
        res.json({ message: 'ID saved successfully' });
    } catch (error) {
        console.error('Error saving ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

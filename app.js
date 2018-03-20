const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Constants
const PORT = 3000;
const QUEUE_SIZE = 30;

// Setup express
const app = express();

// Setup body-parser
app.use(bodyParser.json());

// Setup cors
app.use(cors());

// Setup stats queue
let statsQueue = [];
let nextStatId = 1;

function addStat(stat) {
    stat.id = nextStatId;
    nextStatId += 1;
    while (statsQueue.length >= QUEUE_SIZE) {
        statsQueue.shift();
    }
    statsQueue.push(stat);
}

// Routes
// GET /
app.get('/', function (request, response) {
    const body = {
        message: 'Please use /api'
    };
    response.status(200);
    response.json(body);
});

// GET /api
app.get('/api', function (request, response) {
    const body = {
        links: [
            {
                link: "/api",
                description: "Returns available routes."
            },
            {
                link: "/api/stats",
                description: "GET or POST stats data."
            }
        ]
    };
    response.status(200);
    response.json(body);
});

function containsNewerThan(query) {
    if (query !== {}) {
        if (!isNaN(query.newerThan)) {
            return true;
        }
    }
    return false;
}

// GET /api/stats
app.get('/api/stats', function (request, response) {
    let body = [].concat(statsQueue);
    const query = request.query;
    if (containsNewerThan(query)) {
        var id = query.newerThan;
        body = body.filter(
            stat => stat.id > id
        );
    }
    body.reverse();
    response.status(200);
    response.json(body);
});

// POST /api/stats
app.post('/api/stats', function (request, response) {
    const stat = request.body;
    // TODO: Validation
    addStat(stat);
    response.status(201);
    response.json(stat);
});

// Run app
app.listen(PORT, function () {
    console.log(`Server running on port ${PORT}`);
});
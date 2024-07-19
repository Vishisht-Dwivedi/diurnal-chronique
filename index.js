//requiring packages
const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const path = require('path')
const app = express();

//using and setting paths
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');
app.set('trust proxy', true)

//date
let currentDate = new Date();
const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
};
let parsedDate;

//routes
app.get('/', async (req, res) => {
    parsedDate = currentDate.toLocaleDateString('us-EN', options);
    res.render('index', { date: parsedDate });
})

app.listen(3000, (req, res) => {
    console.log('server working on port 3000')
})
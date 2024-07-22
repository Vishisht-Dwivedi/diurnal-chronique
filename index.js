//requiring packages
const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');
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
let data;
let tagsArr;
//routes
app.use(async (req, res, next) => {
    axios.get('https://timesofindia.indiatimes.com/feeds/newsdefaultfeeds.cms?feedtype=sjson#')
        .then((response) => {
            if (response.data.NewsItem.length % 2 === 0) {
                data = response.data;
            } else {
                const changedArray = response.data.NewsItem.slice(0, -1);
                response.data.NewsItem = changedArray;
                data = response.data;
            }
            tagsArr = [];
            for (let e of data.NewsItem) {
                const tags = e.Keywords.split(',');
                tagsArr.push(tags);
            }
            next();
        })
        .catch((err) => {
            console.log(err)
            next();
        });
})
app.get('/', async (req, res) => {

    parsedDate = currentDate.toLocaleDateString('us-EN', options);
    res.render('index', { date: parsedDate, data: data, tagsArr: tagsArr });
})

app.listen(3000, (req, res) => {
    console.log('server working on port 3000')
})
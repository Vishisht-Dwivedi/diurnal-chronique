//requiring packages
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');
const app = express();
const topNewsModel = require('./models/topNews');
//using and setting paths
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');
app.set('trust proxy', true)

mongoose.connect('mongodb://localhost:27017/News_Website')
    .then(() => {
        console.log('Connection Estabilished');
    })
    .catch((err) => {
        console.log("ERROR", err);
    });
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
//date Parsing
function dateConstructor(dateline) {

    const dateArr = dateline.split(',').join('').split(' ');
    let dateObject = new Date(`${dateArr[0]} ${dateArr[1]}, ${dateArr[2]}`)
    let time;
    let day;

    //time formatting
    const unformattedTime = dateArr[3];
    if (unformattedTime[5] === "P" && Number(unformattedTime.slice(0, 3)) < 12) {
        let hour = Number(unformattedTime.slice(0, 3)) + 12;
        let minutes = unformattedTime.slice(3, 5);
        time = `${hour}.${minutes}`;
    } else if (unformattedTime[5] === "A" && Number(unformattedTime.slice(0, 3)) > 12) {
        let hour = '00';
        let minutes = unformattedTime.slice(3, 5);
        time = `${hour}.${minutes}`;
    } else {
        time = unformattedTime.slice(0, 5);
    }

    //day formatting
    let fday = Number(dateArr[1]);
    if (String(fday).length !== 2) {
        day = '0' + fday;
    } else {
        day = fday;
    }

    //month formatting
    let fmonth = dateObject.getMonth() + 1;
    let month;

    if (String(fmonth).length !== 2) {
        month = '0' + fmonth;
    } else {
        month = fmonth;
    }

    let year = dateObject.getFullYear();

    return `${year}${month}${day}${time}`;
}
//routes
app.use(async (req, res, next) => {

    axios.get('https://timesofindia.indiatimes.com/feeds/newsdefaultfeeds.cms?feedtype=sjson#')
        .then((response) => {


            const newsArr = response.data.NewsItem;
            for (let element of newsArr) {
                const options = { upsert: true, new: true }
                topNewsModel.findOneAndUpdate({ _id: Number(element.NewsItemId) }, {
                    Headline: element.HeadLine,
                    ByLine: element.ByLine,
                    Date: element.DateLine,
                    Photo: element.Image.Photo,
                    Caption: element.Caption,
                    Keywords: element.Keywords.split(','),
                    Story: element.Story,
                    WebURL: element.WebURL,
                    DateNumber: dateConstructor(element.DateLine)
                }, options)
                    .then(() => { return })
                    .catch((err) => console.log('Error in updating elements->', err));
            }
            next();
        })
        .catch((err) => {
            console.log("Error in connection with API->", err);
            next();
        });

    data = await topNewsModel.find({}).sort({ DateNumber: -1 }).limit(26);

})
app.get('/', async (req, res) => {
    parsedDate = currentDate.toLocaleDateString('us-EN', options);
    res.render('index', { date: parsedDate, data: data });
})

app.listen(3000, (req, res) => {
    console.log('server working on port 3000')
})
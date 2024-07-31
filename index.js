//requiring packages
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');
const app = express();
const topNewsModel = require(path.join(__dirname, '/models/topNews'));
const businessModel = require(path.join(__dirname, '/models/business'));
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
// Important inside routes
let parsedDate;
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
//MONGOOSE MODEL HANDLING
//object construction that takes an element of apidata as an argument
class TopHeadlinesObj {
    constructor(element) {
        this.Headline = element.HeadLine;
        this.ByLine = element.ByLine;
        this.Date = element.DateLine;
        this.Photo = element.Image.Photo;
        this.Caption = element.Caption;
        this.Keywords = element.Keywords.split(',');
        this.Story = element.Story;
        this.WebURL = element.WebURL;
        this.DateNumber = dateConstructor(element.DateLine)
    }
}
class BusinessObj {
    constructor(element) {
        this.Headline = element.title;
        this.Date = element.pubDate;
        this.Photo = element.enclosure['@url'];
        this.Caption = element.description.replace(/(<([^>]+)>)/gi, "");
        this.WebURL = element.link;
        this.DateNumber = Date.parse(element.pubDate);
    }
}
//updating function that takes in the model to put data in, the constructor objects and the element which needs to be passed into the constructor functions.
async function updateToDB(Model, Object, element) {
    const options = { upsert: true, new: true }
    const obj = new Object(element);
    if (!element.NewsItemId) {
        Model.findOneAndUpdate({ _id: Number(element.link.slice(-13, -4)) }, obj, options)
            .then(() => { return })
            .catch((err) => console.log('Error in updating elements->', err));
    } else {
        Model.findOneAndUpdate({ _id: Number(element.NewsItemId) }, obj, options)
            .then(() => { return })
            .catch((err) => console.log('Error in updating elements->', err));
    }

}
//API URLS
const topHeadlinesAPI = "https://timesofindia.indiatimes.com/feeds/newsdefaultfeeds.cms?feedtype=sjson#";
const businessAPI = "https://timesofindia.indiatimes.com/rssfeeds/1898055.cms?feedtype=sjson";
const quotesAPI = "https://zenquotes.io/api/quotes";
const pexelsAPIKEY = 'TH3i6Z49qLiG3odhQuIYDIaIMJf6AKRzWCWTlg1M8pv9KcCaPLUMVxxH';
const pexelsAPI = 'https://api.pexels.com/v1/search?query=people&color=gray&size=small&per_page=3';
const artAPI = 'https://api.artic.edu/api/v1/artworks/';
//API HANDLING
async function getDataAndUpdate(model, Object, apiURL) {
    return axios.get(apiURL)
        .then((response) => {
            let newsArr;
            if (apiURL === topHeadlinesAPI) {
                newsArr = response.data.NewsItem;
            } else if (apiURL === businessAPI) {
                newsArr = response.data.channel.item;
            }
            for (let element of newsArr) {
                updateToDB(model, Object, element);

            }
        })
        .catch((err) => {
            console.log("Error in connection with API->", err);
        });
}
//setting up a cache to store timestamps
const cache = {};
cache['quote'] = {};
cache['quoteImg'] = {};
async function getDataNoDB(ApiURL, cacheKey, ApiHeaders) {
    let currentTime = Date.now();
    let res;
    try {
        if (currentTime - (cache[cacheKey].timestamp || 0) > 86400000) {
            res = await axios.get(ApiURL, ApiHeaders);
            cache[cacheKey].data = res.data;
            cache[cacheKey].timestamp = Date.now();
        }
    } catch (error) {
        console.log(error);
    }
}
//Calling API every 30 minutes
setInterval(() => {
    cacheTimestampChecker(topNewsModel, 'thlTimeStamp', TopHeadlinesObj, topHeadlinesAPI);
}, 1800000)

//checker function to check difference in timestamps of API calls
async function cacheTimestampChecker(Model, cacheKey, Obj, apiURL, cacheTime) {
    let data;
    //checking to see if objects in database aren't older than 10 minutes from current time, if they are call api getter again
    let currentTime = Date.now();
    if (currentTime - (cache[cacheKey] || 0) > cacheTime) {
        getDataAndUpdate(Model, Obj, apiURL);
        cache[cacheKey] = currentTime;
        data = await Model.find({}).sort({ DateNumber: -1 }).limit(8);
    } else {
        data = await Model.find({}).sort({ DateNumber: -1 }).limit(8);
    }
    return data;
}

//routes
app.get('/', async (req, res) => {
    let data = await cacheTimestampChecker(topNewsModel, 'thlTimeStamp', TopHeadlinesObj, topHeadlinesAPI, 600000);
    let leftData = await cacheTimestampChecker(businessModel, 'businessTimeStamp', BusinessObj, businessAPI, 600000);
    parsedDate = currentDate.toLocaleDateString('us-EN', options);
    await getDataNoDB(pexelsAPI, 'quoteImg', { headers: { Authorization: pexelsAPIKEY } });
    await getDataNoDB(quotesAPI, 'quote');
    for (let i of data) {
        let p1 = i.Story.replace(/<([A-z]+)([^>^/]*)>\s*<\/\1>/gim, "<br>");
        let p2 = p1.replace("</a>", "</a><br>");
        i.Story = p2;
    }
    res.render('index', { date: parsedDate, data: data, leftData: leftData, quoteArr: cache['quote'].data, quoteImg: cache['quoteImg'].data.photos });
})

app.listen(3000, (req, res) => {
    console.log('server working on port 3000')
});
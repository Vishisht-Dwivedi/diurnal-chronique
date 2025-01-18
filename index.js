//requiring packages
require("dotenv").config();
const keys = process.env;
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');
const app = express();
const topNewsModel = require(path.join(__dirname, '/models/topNews'));
const businessModel = require(path.join(__dirname, '/models/business'));
const artModel = require(path.join(__dirname, "/models/art"));
const marketInstruments = require(path.join(__dirname, "marketInstruments"));

//using and setting paths
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');
app.set('trust proxy', true)

mongoose.connect('mongodb://127.0.0.1/News_Website')
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
class ArtObj {
    constructor(element) {
        this.title = element.title;
        this.image_Id = element.image_id;
        this.artist_display = element.artist_display;
        this.description = element.description;
        this.provenance_text = element.provenance_text;
        this.artist = { name: element.artist_title, artist_id: element.artist_id };
        this.keywords = element.term_titles.concat(element.subject_titles, element.technique_titles)
        this.IIIFBase = IIIFBase;
    }
}
//updating function that takes in the model to put data in, the constructor objects and the element which needs to be passed into the constructor functions.
async function updateToDB(Model, Object, element) {
    const options = { upsert: true, new: true }

    if (Model === businessModel) {
        const obj = new Object(element);
        Model.findOneAndUpdate({ _id: Number(element.link.slice(-13, -4)) }, obj, options)
            .then(() => { return })
            .catch((err) => console.log('Error in updating business elements->', err));
    } else if (Model === topNewsModel) {
        const obj = new Object(element);
        Model.findOneAndUpdate({ _id: Number(element.NewsItemId) }, obj, options)
            .then(() => { return })
            .catch((err) => console.log('Error in updating headline elements->', err));
    } else if (Model === artModel) {
        await axios.get(element.api_link)
            .then((response) => {
                const e = response.data.data;
                const obj = new Object(e);
                if (e.description && e.artist_display && e.provenance_text) {
                    Model.findOneAndUpdate({ _id: e.id }, obj, options)
                        .then(() => { return })
                        .catch((err) => console.log('Error in updating art element->', err));
                }
            })
            .catch((err) => {
                console.log("error in updating art API->", err)
            })

    }

}
//API URLS
const topHeadlinesAPI = keys.topHeadlinesAPI;
const businessAPI = keys.businessAPI;
const quotesAPI = keys.quotesAPI;
const pexelsAPIKEY = keys.pexelsAPIKEY;
const pexelsAPI = keys.pexelsAPI;
const artAPI = keys.artAPI;
let IIIFBase;
//API HANDLING
async function getDataAndUpdate(model, Object, apiURL) {
    return axios.get(apiURL)
        .then((response) => {
            let newsArr;
            if (apiURL === topHeadlinesAPI) {
                newsArr = response.data.NewsItem;
            } else if (apiURL === businessAPI) {
                newsArr = response.data.channel.item;
            } else if (apiURL === artAPI) {
                IIIFBase = response.data.config.iiif_url;
                newsArr = response.data.data;
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
cache['businessTimeStamp'];
cache['artTimeStamp'];
cache['thlTimeStamp'];
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
        await getDataAndUpdate(Model, Obj, apiURL);
        cache[cacheKey] = currentTime;
        if (Model !== artModel) {
            data = await Model.find({}).sort({ DateNumber: -1 }).limit(8);
        } else {
            data = await Model.aggregate([{ $sample: { size: 1 } }]);
        }
    } else {
        if (Model !== artModel) {
            data = await Model.find({}).sort({ DateNumber: -1 }).limit(8);
        } else {
            data = await Model.aggregate([{ $sample: { size: 1 } }]);
        }

    }
    return data;
}

//routes
app.get('/', async (req, res) => {
    let data = await cacheTimestampChecker(topNewsModel, 'thlTimeStamp', TopHeadlinesObj, topHeadlinesAPI, 600000);
    let businessData = await cacheTimestampChecker(businessModel, 'businessTimeStamp', BusinessObj, businessAPI, 600000);
    let artData = await cacheTimestampChecker(artModel, 'artTimeStamp', ArtObj, artAPI, 86400000);

    parsedDate = currentDate.toLocaleDateString('us-EN', options);
    await getDataNoDB(pexelsAPI, 'quoteImg', { headers: { Authorization: pexelsAPIKEY } });
    await getDataNoDB(quotesAPI, 'quote');
    for (let i of data) {
        let p1 = i.Story.replace(/<([A-z]+)([^>^/]*)>\s*<\/\1>/gim, "<br>");
        let p2 = p1.replace("</a>", "</a><br>");
        i.Story = p2;
    }
    const heroData = {
        heroMainData: data,
        quoteArr: cache['quote'].data,
        quoteImg: cache['quoteImg'].data.photos
    }
    res.render('index', { date: parsedDate, businessData, heroData, artData: artData });
})

app.get('/chartData', async (req, res) => {
    const cryptoKey = keys.cryptoKey;
    const cryptoAPI = `https://data-api.cryptocompare.com/index/cc/v1/historical/days?market=${req.query.market}&instrument=${req.query.instrument}&aggregate=1&fill=true&apply_mapping=true&response_format=JSON&limit=30&api_key=${cryptoKey}`;
    await axios.get(cryptoAPI)
        .then((response) => {
            res.json(response.data.Data);
        }).catch((err) => {
            console.log("Error in crypto API -> ", err);
        })
});
app.get('/chartData/searchbox', async (req, res) => {
    const arr = await marketInstruments.instruments(req.query.market);
    res.json(arr);
});
app.listen(3000, (req, res) => {
    console.log('server working on port 3000')
});
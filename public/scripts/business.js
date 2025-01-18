console.log("Business connected");
// To make the svg responsive, found from the web
function responsivefy(svg) {
    var container = d3.select(svg.node().parentNode),
        width = parseInt(svg.style("width")),
        height = parseInt(svg.style("height")),
        aspect = width / height;
    svg.attr("viewBox", "0 0 " + width + " " + height)
        .attr("perserveAspectRatio", "xMinYMid")
        .call(resize);
    d3.select(window).on("resize." + container.attr("id"), resize);
    function resize() {
        var targetWidth = parseInt(container.style("width"));
        svg.attr("width", targetWidth);
        svg.attr("height", Math.round(targetWidth / aspect));
    }
}
// fetching the data from the route handler in express
async function getData(market, instrument) {
    const dataset = [];
    await fetch(document.URL + `chartData?market=${market}&instrument=${instrument}`)
        .then(response => response.json())
        .then((data) => {
            for (let i = 0; i < 30; i++) {
                const oldDate = new Date(data[i].TIMESTAMP * 1000);
                const options = { day: '2-digit', month: 'short', year: 'numeric' };
                const formattedDate = oldDate.toLocaleDateString('en-GB', options).replace(/\//g, ' ');
                const newData = {
                    date: formattedDate,
                    high: data[i].HIGH,
                    low: data[i].LOW,
                    open: data[i].OPEN,
                    close: data[i].CLOSE,
                };
                dataset.push(newData);
            }
        })
        .catch(error => console.error('Error:', error));
    return dataset;
}

// drawing to the svg
async function drawChart(market, instrument) {
    const dataset = await getData(market, instrument);
    function parseDate(dateString) {
        const format = d3.timeParse("%d %b %Y"); // 01 Jan 2024
        return format(dateString);
    }
    dataset.forEach(d => {
        d.date = parseDate(d.date);
        d.open = +d.open;
        d.high = +d.high;
        d.low = +d.low;
        d.close = +d.close;
        d.volume = +d.volume;
    });
    const margin = { top: 10, right: 20, bottom: 20, left: 50 };
    const width = window.screen.width * 0.6 - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;
    const svg = d3.select("#stock-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(responsivefy);
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    const xScale = d3.scaleTime()
        .domain(d3.extent(dataset, d => d.date))
        .range([0, innerWidth]);
    const yScale = d3.scaleLinear()
        .domain([d3.min(dataset, d => d.low), d3.max(dataset, d => d.high)])
        .range([innerHeight, 0]);
    const xAxis = d3.axisBottom(xScale);

    g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(xAxis);

    const yAxis = d3.axisLeft(yScale);
    const boxWidth = 10;
    g.append("g")
        .call(yAxis);
    // Define the line generator
    const line = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale((d.open + d.close) / 2));

    // Append the path to the SVG
    svg.append("path")
        .datum(dataset)
        .attr("class", "line")
        .attr("transform", `translate(${margin.left},${margin.top})`)
        .attr("fill", "none")
        .attr("stroke", "#f86d03")
        .attr("stroke-width", 1)
        .attr("d", line);

    function drawCandle(d) {
        // Up day - green
        if (d.close > d.open) {
            g.append("rect")
                .attr("x", xScale(d.date) - boxWidth / 2)
                .attr("y", yScale(d.close))
                .attr("height", yScale(d.open) - yScale(d.close))
                .attr("width", boxWidth)
                .attr("fill", "green");
            // Down day - red   
        } else {
            g.append("rect")
                .attr("x", xScale(d.date) - boxWidth / 2)
                .attr("y", yScale(d.open))
                .attr("height", yScale(d.close) - yScale(d.open))
                .attr("width", boxWidth)
                .attr("fill", "red");
        }
    }
    dataset.forEach(drawCandle);
}
//Making the first one that opens on load.
drawChart('cadli', 'BTC-USD');
//Clearing everything when the user enters new data in the form and remaking the chart
async function updateChart(market, instrument) {
    const svg = d3.select("#stock-chart")
    svg.selectAll("*").remove();
    drawChart(market, instrument);
};
//predefined markets that the api can handle
const markets = ['cadli', 'ccix', 'ccxrp', 'ccxrpperp', 'cd_mc'];
// writing this to prefetch the values for the next input datalist
document.querySelector("#market-autocomplete").addEventListener('input', async (e) => {
    if (markets.indexOf(e.target.value) != -1) {
        const list = document.querySelector("#instrumentNames");
        const optionsArr = await fetch(document.URL + `chartData/searchbox?market=${e.target.value}`)
            .then(response => response.json())
            .then(data => { return data })
            .catch((err) => { return [] });
        optionsArr.forEach((option) => {
            const newOption = document.createElement('option');
            newOption.setAttribute('value', option);
            newOption.textContent = option;
            list.appendChild(newOption);
        });
    }
});
//Upon submitting the form.. call the update chart method
document.querySelector("#chart-form").addEventListener('submit', async (event) => {
    event.preventDefault();
    const market = document.querySelector('#market-autocomplete').value;
    const instrument = document.querySelector('#stock-autocomplete').value;
    updateChart(market, instrument);
})
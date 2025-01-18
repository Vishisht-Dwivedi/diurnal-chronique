console.log("weather connection");
navigator.geolocation.getCurrentPosition((position) => {
    const weatherDiv = document.querySelector(".weather-forecast");
    fetch(`https://api.weatherapi.com/v1/forecast.json?key=b006c8ba5d3a4ab3bda132730250801&q=${position.coords.latitude},${position.coords.longitude}`).then(
        (response) => response.json()
    ).then((response) => {
        weatherDiv.innerHTML = `High: ${response.forecast.forecastday[0].day.maxtemp_c}&#8451 Low: ${response.forecast.forecastday[0].day.mintemp_c}&#8451`;
    });
});
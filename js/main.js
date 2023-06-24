const geoApiUrl = "https://api.api-ninjas.com/v1/geocoding?city="
const geoAPIKey = "IHJ8vyMmvPEcoCpmk+Jc8Q==MinUzFV6mTSpFzxb"

var currentGeoLocation = {
    "name": "Emden",
    "latitude": 53.3670541,
    "longitude": 7.2058304,
    "country": "DE",
    "state": "Lower Saxony"
}

async function getData() {
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${currentGeoLocation.latitude}&longitude=${currentGeoLocation.longitude}&hourly=temperature_2m,precipitation_probability,cloudcover,apparent_temperature,windspeed_80m,uv_index&timezone=Europe%2FBerlin`;
    const response = await fetch(apiUrl)
    const jsonData = await response.json();
    return jsonData;
}

async function getCityRecommendations(input) {
    const response = await fetch(geoApiUrl + input, {
        headers: {
            "X-Api-Key": geoAPIKey
        }
    })
    const jsonData = await response.json();
    return jsonData;
}

function replaceText(data) {
    let currentTimeIndex = new Date().getHours() // today

    let temperature = data.hourly.temperature_2m[currentTimeIndex];
    let precipitation = data.hourly.precipitation_probability[currentTimeIndex];
    let cloudCover = data.hourly.cloudcover[currentTimeIndex];  
    let realFeel = data.hourly.apparent_temperature[currentTimeIndex];
    let uvIndex = data.hourly.uv_index[currentTimeIndex];
    let wind = data.hourly.windspeed_80m[currentTimeIndex]; 

    let iconPath = getIconFromWeather(precipitation, cloudCover, currentTimeIndex);
    let conRealFeel = document.getElementById("real-feel-temp");
    conRealFeel.innerText = parseInt(realFeel) + " °C";
    let conUvIndex = document.getElementById("uv-index");
    conUvIndex.innerText = Math.ceil(uvIndex);
    let conPrecipitation = document.getElementById("chance-rain");
    conPrecipitation.innerText = precipitation + "%";
    let conWind = document.getElementById("wind-speed");
    conWind.innerText = wind + " km/h";
    let mainTemperatur = document.getElementById("main-temperatur");
    mainTemperatur.innerText = parseInt(temperature) + " °C";
    let mainChanceRain = document.getElementById("main-chance-rain");
    mainChanceRain.innerText = precipitation;
    let mainCityName = currentGeoLocation.name;
    document.getElementById("main-city").innerText = mainCityName;
    document.getElementById("main-weather-icon").src = iconPath;
}

function generateForecastElements(data) {
    let dayForecastDiv = document.getElementsByClassName("day-forecast")[0];
    dayForecastDiv.innerHTML = "<span class='forecast-title'>Today's Forecast</span>";

    for (let i = 0; i < 6; i++) {
        let hourIndex = 6 + (i * 3)

        let temperature = parseInt(data.hourly.temperature_2m[hourIndex]);
        let precipitation = data.hourly.precipitation_probability[hourIndex];
        let cloudCover = data.hourly.cloudcover[hourIndex];

        let iconPath = getIconFromWeather(precipitation, cloudCover, hourIndex);

        dayForecastDiv.innerHTML += `<div class="today-forecast-element">
        <span class="forecast-hour">${hourIndex}:00 Uhr</span>
        <img class="forecast-image" src="${iconPath}"/>
        <span class="forecast-temp">${temperature} °C</span>
        </div>`
    }
}

function findLowHighAvgData(startHourIndex, data) {
    let highestTemp = -Infinity;
    let lowestTemp = Infinity;
    let avgCloudCover = 0;
    let avgPrecipitation = 0;

    for(let i = startHourIndex; i < startHourIndex + 24; i++) {
        let temperature = data.hourly.temperature_2m[i];
        let cloudCover = data.hourly.cloudcover[i];
        let precipitation = data.hourly.precipitation_probability[i];

        avgPrecipitation += precipitation;
        avgCloudCover += cloudCover;
        
        if(temperature > highestTemp) {
            highestTemp = temperature;
        }
        if(temperature < lowestTemp) {
            lowestTemp = temperature;
        }
    }
    return { highestTemp: parseInt(highestTemp), lowestTemp: parseInt(lowestTemp), avgCloudCover: avgCloudCover / 24, avgPrecipitation: avgPrecipitation / 24 };
}


function generateWeekForecastElements(data) {
    //console.log(dayNames[date.getDay()]);
    let weekForecastDiv = document.getElementsByClassName("week-forecast")[0];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    weekForecastDiv.innerHTML = "<span class='week-forecast-title'>7-Day Forecast</span>";
    
    for(let i = 0; i < 7; i++) {
        let hourIndex = i * 24
        let date = new Date();
        date.setHours(date.getHours() + hourIndex);
        let weekDay = i == 0 ? "Today" : dayNames[date.getDay()];
        let processedData = findLowHighAvgData(hourIndex, data) // {lowestTemp: "20", highestTemp: "30"}
        let iconPath = getIconFromWeather(processedData.avgPrecipitation,processedData.avgCloudCover,12)

        weekForecastDiv.innerHTML += `<div class="week-forecast-element">
        <span class="week-forecast-day">${weekDay}</span>
        <img class="week-forecast-image" src="${iconPath}"/>
        <span class="week-forecast-temp">${processedData.highestTemp} / ${processedData.lowestTemp}</span>
        </div>`
        
    }
    
    
}

function getIconFromWeather(precipitation, cloudCover, hour) {
    let iconBasePath = "images/animated/";
    console.log(precipitation, cloudCover, hour);
    if(hour % 24 >= 6 && hour % 24 < 21) {
        // day
        if(cloudCover < 33) {
            if(precipitation < 33) {
                return iconBasePath + "day.svg"
            }else if(precipitation >= 33 && precipitation <= 66)
                return iconBasePath + "rainy-5.svg"
            else if(precipitation > 66) 
                return iconBasePath + "rainy-5.svg"
        }else if(cloudCover >= 33 && cloudCover <= 66){
            if(precipitation < 33) {
                return iconBasePath + "cloudy-day-1.svg"
            }else if(precipitation >= 33 && precipitation <= 66) {
                return iconBasePath + "rainy-1.svg"
            }else if(precipitation > 66) 
                return iconBasePath + "rainy-5.svg"
        } else if( cloudCover > 66) {
            if(precipitation < 33) 
                return iconBasePath + "cloudy.svg"
            else if(precipitation >= 33 && precipitation <= 66)
                return iconBasePath + "rainy-5.svg"
            else if(precipitation > 66) return iconBasePath + "rainy-5.svg"
        }

    }else{
        // night
        if(cloudCover < 33) {
            if(precipitation < 33) {
                return iconBasePath + "night.svg"
            }else if(precipitation >= 33 && precipitation <= 66)
                return iconBasePath + "rainy-5.svg"
            else if(precipitation > 66) 
                return iconBasePath + "rainy-5.svg"
        }else if(cloudCover >= 33 && cloudCover <= 66){
            if(precipitation < 33) {
                return iconBasePath + "cloudy-night-1.svg"
            }else if(precipitation >= 33 && precipitation <= 66) {
                return iconBasePath + "rainy-1.svg"
            }else if(precipitation > 66) 
                return iconBasePath + "rainy-5.svg"
        } else if( cloudCover > 66) {
            if(precipitation < 33) 
                return iconBasePath + "cloudy.svg"
            else if(precipitation >= 33 && precipitation <= 66)
                return iconBasePath + "rainy-5.svg"
            else if(precipitation > 66) return iconBasePath + "rainy-5.svg"
        }
    }


}



function fetchData() {
    
    getData().then((data) => {
        console.log(data);
        generateWeekForecastElements(data)
        generateForecastElements(data);
        replaceText(data);
    })
}

function initialization() {
    let searchBar = document.getElementById("search-city-input");
    let searchBarDropdown = document.getElementById("search-bar-dropdown");

    searchBar.addEventListener('keydown', (event) => {
        if(event.code == "Enter") {
            let inputValue = event.target.value;
            if(inputValue.length >= 3) {
                getCityRecommendations(inputValue).then((geoData) => {
                    searchBarDropdown.innerHTML = "";
                    geoData.forEach((city) => {
                        let cityString = `${city.name}, ${city.state ? city.state : ""} ${city.country}`
                        let newCityButton = document.createElement("li");
                        newCityButton.innerText = cityString;
                        newCityButton.addEventListener('click', (event) => {
                            let buttonCityString = event.target.innerText;
                            searchBar.value = buttonCityString;
                            console.log(city);
                            currentGeoLocation = city;
                            fetchData();
                            searchBarDropdown.innerHTML = "";
                        })
                        searchBarDropdown.appendChild(newCityButton);
                    })
                })
            }
        }
    })
    searchBar.addEventListener('input', (event) => {

    })

    fetchData();
}

initialization();
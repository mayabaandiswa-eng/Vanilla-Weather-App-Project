let apiKey = "a3te025ob303fbf3720b84aa127ffc8b";

const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");

const cityElement = document.querySelector("#city");
const dateTimeElement = document.querySelector("#date-time");
const descriptionElement = document.querySelector("#description");
const humidityElement = document.querySelector("#humidity");
const windElement = document.querySelector("#wind");
const temperatureElement = document.querySelector("#temperature");
const iconElement = document.querySelector("#icon");

const forecastElement = document.querySelector("#forecast");

const loadingElement = document.querySelector("#loading");
const errorElement = document.querySelector("#error-message");


const weatherIcons = {

    0: {
        description: "Clear Sky",
        day: "https://shecodes-assets.s3.amazonaws.com/api/weather/icons/clear-sky-day.png"
    },

    1: {
        description: "Mainly Clear",
        day: "https://shecodes-assets.s3.amazonaws.com/api/weather/icons/clear-sky-day.png"
    },

    2: {
        description: "Partly Cloudy",
        day: "https://shecodes-assets.s3.amazonaws.com/api/weather/icons/partly-cloudy-day.png"
    },

    3: {
        description: "Overcast",
        day: "https://shecodes-assets.s3.amazonaws.com/api/weather/icons/overcast.png"
    },

    45: {
        description: "Foggy",
        day: "https://shecodes-assets.s3.amazonaws.com/api/weather/icons/overcast.png"
    },

    48: {
        description: "Foggy",
        day: "https://shecodes-assets.s3.amazonaws.com/api/weather/icons/overcast.png"
    },

    51: {
        description: "Light Drizzle",
        day: "https://shecodes-assets.s3.amazonaws.com/api/weather/icons/rain.png"
    },

    53: {
        description: "Drizzle",
        day: "https://shecodes-assets.s3.amazonaws.com/api/weather/icons/rain.png"
    },

    55: {
        description: "Heavy Drizzle",
        day: "https://shecodes-assets.s3.amazonaws.com/api/weather/icons/rain.png"
    },

    61: {
        description: "Light Rain",
        day: "https://shecodes-assets.s3.amazonaws.com/api/weather/icons/rain.png"
    },

    63: {
        description: "Rain",
        day: "https://shecodes-assets.s3.amazonaws.com/api/weather/icons/rain.png"
    },

    65: {
        description: "Heavy Rain",
        day: "https://shecodes-assets.s3.amazonaws.com/api/weather/icons/rain.png"
    },

    71: {
        description: "Light Snow",
        day: "https://shecodes-assets.s3.amazonaws.com/api/weather/icons/snow.png"
    },

    73: {
        description: "Snow",
        day: "https://shecodes-assets.s3.amazonaws.com/api/weather/icons/snow.png"
    },

    75: {
        description: "Heavy Snow",
        day: "https://shecodes-assets.s3.amazonaws.com/api/weather/icons/snow.png"
    },

    80: {
        description: "Rain Showers",
        day: "https://shecodes-assets.s3.amazonaws.com/api/weather/icons/rain.png"
    },

    81: {
        description: "Rain Showers",
        day: "https://shecodes-assets.s3.amazonaws.com/api/weather/icons/rain.png"
    },

    82: {
        description: "Heavy Rain Showers",
        day: "https://shecodes-assets.s3.amazonaws.com/api/weather/icons/rain.png"
    },

    95: {
        description: "Thunderstorm",
        day: "https://shecodes-assets.s3.amazonaws.com/api/weather/icons/storm.png"
    }

};


searchForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const city = searchInput.value.trim();

    if (!city) {
        return;
    }

    searchCity(city);

});


async function searchCity(city) {

    showLoading();
    clearError();

    try {

        const locationResponse = await axios.get(
            "https://geocoding-api.open-meteo.com/v1/search",
            {
                params: {
                    name: city,
                    count: 1,
                    language: "en",
                    format: "json"
                }
            }
        );


        if (
            !locationResponse.data.results ||
            locationResponse.data.results.length === 0
        ) {

            throw new Error("City not found");

        }


        const location = locationResponse.data.results[0];


        // Get weather
        const weatherResponse = await axios.get(
            "https://api.open-meteo.com/v1/forecast",
            {
                params: {

                    latitude: location.latitude,

                    longitude: location.longitude,

                    current:
                        "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",

                    daily:
                        "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",

                    timezone: "auto",

                    forecast_days: 7

                }
            }
        );


        updateCurrentWeather(
            location,
            weatherResponse.data
        );


        updateForecast(
            weatherResponse.data
        );


    } catch (error) {

        console.error(error);

        showError(
            "Sorry, we couldn't find that city. Please try another city."
        );

    } finally {

        hideLoading();

    }

}


function updateCurrentWeather(location, weatherData) {

    const current = weatherData.current;

    cityElement.innerHTML = location.name;


    if (location.country) {

        cityElement.innerHTML =
            `${location.name}, ${location.country_code || ""}`;

    }


    const date = new Date(
        current.time
    );

    dateTimeElement.innerHTML =
        formatDate(date);


    const weather =
        weatherIcons[current.weather_code]
        || weatherIcons[0];


    descriptionElement.innerHTML =
        weather.description;


    temperatureElement.innerHTML =
        Math.round(current.temperature_2m);


    humidityElement.innerHTML =
        Math.round(current.relative_humidity_2m);


    windElement.innerHTML =
        Math.round(current.wind_speed_10m * 10) / 10;


    iconElement.src =
        weather.day;

    iconElement.alt =
        weather.description;

}


function updateForecast(weatherData) {

    const daily = weatherData.daily;

    forecastElement.innerHTML = "";


    daily.time.forEach(function (date, index) {

        const forecastDate =
            new Date(date + "T12:00:00");


        const weatherCode =
            daily.weather_code[index];


        const weather =
            weatherIcons[weatherCode]
            || weatherIcons[0];


        const maxTemperature =
            Math.round(
                daily.temperature_2m_max[index]
            );


        const minTemperature =
            Math.round(
                daily.temperature_2m_min[index]
            );


        const rainProbability =
            daily.precipitation_probability_max[index];


        const card =
            document.createElement("div");


        card.className =
            "forecast-card";


        card.style.animationDelay =
            `${index * 0.08}s`;


        card.innerHTML = `

            <div class="forecast-day">
                ${getDayName(forecastDate)}
            </div>

            <div class="forecast-date">
                ${formatShortDate(forecastDate)}
            </div>

            <img
                class="forecast-icon"
                src="${weather.day}"
                alt="${weather.description}"
            >

            <div class="forecast-description">
                ${weather.description}
            </div>

            <div class="forecast-temperatures">

                <span class="forecast-high">
                    ${maxTemperature}°
                </span>

                /

                <span class="forecast-low">
                    ${minTemperature}°
                </span>

            </div>

            <div class="rain">
                💧 ${rainProbability || 0}% rain
            </div>

        `;


        forecastElement.appendChild(card);

    });

}


function formatDate(date) {

    const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];


    let hours =
        date.getHours();


    let minutes =
        date.getMinutes();


    if (minutes < 10) {

        minutes =
            `0${minutes}`;

    }


    return `
        ${days[date.getDay()]}
        ${hours}:${minutes}
    `;

}


function getDayName(date) {

    const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];


    return days[
        date.getDay()
    ];

}


function formatShortDate(date) {

    return date.toLocaleDateString(
        "en-ZA",
        {
            day: "numeric",
            month: "short"
        }
    );

}


function showLoading() {

    loadingElement.style.display =
        "block";

}


function hideLoading() {

    loadingElement.style.display =
        "none";

}


function showError(message) {

    errorElement.innerHTML =
        message;

}


function clearError() {

    errorElement.innerHTML =
        "";

}


searchCity("Cape Town");

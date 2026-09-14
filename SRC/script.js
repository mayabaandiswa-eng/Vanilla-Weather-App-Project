let apiKey = "a3te02ob303fbf3720b84aa127ffc8b";

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


function getWeatherInfo(code) {

    const weather = {

        0: ["Clear Sky", "☀️"],
        1: ["Mainly Clear", "🌤️"],
        2: ["Partly Cloudy", "⛅"],
        3: ["Overcast", "☁️"],

        45: ["Foggy", "🌫️"],
        48: ["Foggy", "🌫️"],

        51: ["Light Drizzle", "🌦️"],
        53: ["Drizzle", "🌦️"],
        55: ["Heavy Drizzle", "🌧️"],

        61: ["Light Rain", "🌦️"],
        63: ["Rain", "🌧️"],
        65: ["Heavy Rain", "🌧️"],

        71: ["Light Snow", "🌨️"],
        73: ["Snow", "❄️"],
        75: ["Heavy Snow", "❄️"],

        80: ["Rain Showers", "🌦️"],
        81: ["Rain Showers", "🌧️"],
        82: ["Heavy Rain Showers", "🌧️"],

        95: ["Thunderstorm", "⛈️"],
        96: ["Thunderstorm", "⛈️"],
        99: ["Thunderstorm", "⛈️"]

    };

    return weather[code] || ["Unknown", "🌤️"];
}


searchForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const city = searchInput.value.trim();

    if (city === "") {
        return;
    }

    searchCity(city);

});


async function searchCity(city) {

    showLoading();
    clearError();

    try {

        const locationResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );

        if (!locationResponse.ok) {
            throw new Error("Could not find location");
        }

        const locationData = await locationResponse.json();

        if (
            !locationData.results ||
            locationData.results.length === 0
        ) {

            throw new Error("City not found");

        }

        const location = locationData.results[0];

        const weatherURL =
            `https://api.open-meteo.com/v1/forecast` +
            `?latitude=${location.latitude}` +
            `&longitude=${location.longitude}` +
            `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code` +
            `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
            `&timezone=auto` +
            `&forecast_days=7`;


        const weatherResponse =
            await fetch(weatherURL);


        if (!weatherResponse.ok) {
            throw new Error("Weather information unavailable");
        }


        const weatherData =
            await weatherResponse.json();


        console.log("Weather data:", weatherData);

        updateCurrentWeather(
            location,
            weatherData
        );

        updateForecast(
            weatherData
        );


    } catch (error) {

        console.error("Weather error:", error);

        showError(
            "We couldn't find that city. Please try another city."
        );

    } finally {

        hideLoading();

    }

}


function updateCurrentWeather(
    location,
    weatherData
) {

    const current =
        weatherData.current;


    cityElement.textContent =
        location.name;


    if (location.country_code) {

        cityElement.textContent =
            `${location.name}, ${location.country_code}`;

    }


    const date =
        new Date(current.time);


    dateTimeElement.textContent =
        formatDate(date);


    const weather =
        getWeatherInfo(
            current.weather_code
        );


    descriptionElement.textContent =
        weather[0];


    temperatureElement.textContent =
        Math.round(
            current.temperature_2m
        );


    humidityElement.textContent =
        Math.round(
            current.relative_humidity_2m
        );


    windElement.textContent =
        Math.round(
            current.wind_speed_10m * 10
        ) / 10;

    iconElement.src = "";

    iconElement.alt =
        weather[0];

    iconElement.style.display =
        "none";

}


function updateForecast(weatherData) {

    const daily =
        weatherData.daily;


    forecastElement.innerHTML = "";


    console.log(
        "Forecast days:",
        daily.time
    );


    for (
        let i = 0;
        i < daily.time.length;
        i++
    ) {

        const date =
            new Date(
                daily.time[i] + "T12:00:00"
            );


        const weather =
            getWeatherInfo(
                daily.weather_code[i]
            );


        const high =
            Math.round(
                daily.temperature_2m_max[i]
            );


        const low =
            Math.round(
                daily.temperature_2m_min[i]
            );


        const rain =
            daily.precipitation_probability_max[i] || 0;

        const card =
            document.createElement("div");


        card.className =
            "forecast-card";


        card.innerHTML = `

            <div class="forecast-day">
                ${getDayName(date)}
            </div>

            <div class="forecast-date">
                ${formatShortDate(date)}
            </div>

            <div class="forecast-emoji">
                ${weather[1]}
            </div>

            <div class="forecast-description">
                ${weather[0]}
            </div>

            <div class="forecast-temperatures">

                <span class="forecast-high">
                    ${high}°
                </span>

                <span class="forecast-low">
                    ${low}°
                </span>

            </div>

            <div class="rain">
                💧 ${rain}% rain
            </div>

        `;


        forecastElement.appendChild(card);

    }

}


function getDayName(date) {

    return date.toLocaleDateString(
        "en-ZA",
        {
            weekday: "short"
        }
    );

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


function formatDate(date) {

    return date.toLocaleDateString(
        "en-ZA",
        {
            weekday: "long",
            hour: "2-digit",
            minute: "2-digit"
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

    errorElement.textContent =
        message;

}


function clearError() {

    errorElement.textContent =
        "";

}



searchCity("Cape Town");

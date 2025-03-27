const APIkey = "c026aac7e230ca6ebde4ac5057eb5562";

const searchInputEl = $('#search-input');  // Input element for city name
const searchButton = $('#search-button');  // Button to trigger search
const searchHistoryEl = $('#search-history');  // Search history element
const weatherDisplay = $('#current-forecast');  // Where the weather info will be displayed
const formSearch = $('#search-form');  // Form element

// Function to save and display search history
function saveToHistory(city) {
    let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    if (!history.includes(city)) {
        history.push(city);
        localStorage.setItem('searchHistory', JSON.stringify(history));
        displayHistory();
    }
}

// Function to display search history as buttons
function displayHistory() {
    const history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    searchHistoryEl.empty(); // Clear old history
    
    history.forEach(city => {
        const historyButton = `<button class="history-btn btn btn-secondary p-1 mb-3" data-city="${city}">${city}</button>`;
        searchHistoryEl.append(historyButton);
    });
}

// Use event delegation for dynamically created buttons
$(document).on('click', '.history-btn', function(event) {
    event.preventDefault();  // Prevent default action (e.g., form submission)

    const city = $(this).data('city');  // Get the city from the button's data attribute
    fetchWeatherForCity(city);  // Call the function to fetch the weather
});

function fetchWeatherForCity(city) {
    console.log(`Fetching weather for ${city}`);  // Debug: Check city value
    
    // Geocoding API to get lat/lon from city name
    const geocodeAPI = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${APIkey}`;
    
    fetch(geocodeAPI)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                console.log('City not found.');
                return;
            }

            const lat = data[0].lat;
            const lon = data[0].lon;

            // Fetch weather data using lat/lon
            const APInow = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${APIkey}&units=imperial`;

            return fetch(APInow);
        })
        .then(function(response) {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(function(data) {
            console.log('Weather data:', data);
            displayCurrentWeather(data);  // Display current weather
            display5DayWeather(data); // Display 5-day forecast
        })
        .catch(function(error) {
            console.error('Error fetching data:', error);
        });
}


function submitAndFetch(event) {
    event.preventDefault();  // Prevent form submission

    const city = searchInputEl.val();  // Get city name from input

    if (!city) {
        console.log("No city entered.");
        return;  // Exit if no city is entered
    }

    console.log(`Fetching weather for: ${city}`);  // Debug city name

    fetchWeatherForCity(city);  // Fetch weather for entered city
    saveToHistory(city);  // Save city to search history
}

// Call displayHistory() on page load to show previous searches
$(document).ready(() => {
    displayHistory();
});

// Function to map weather conditions to emojis
function getWeatherEmoji(weatherCondition) {
    const emojiMap = {
        Clear: "☀️",       // Sunny
        Clouds: "☁️",      // Cloudy
        Rain: "🌧️",       // Rainy
        Snow: "❄️",        // Snowy
        Thunderstorm: "⛈️", // Thunderstorm
        Drizzle: "🌦️",    // Light rain/drizzle
        Mist: "🌫️",       // Mist/Fog
        Haze: "🌫️",       // Hazy
        Smoke: "💨",       // Smoke
        Dust: "🌪️",       // Dusty
        Fog: "🌫️",        // Fog
    };
    return emojiMap[weatherCondition] || "🌍";  // Default emoji if not found
}

// A function to display the current weather data
function displayCurrentWeather(data) {
    const currentWeather = data.list[0];
    const cityName = data.city.name;
    const weatherEmoji = getWeatherEmoji(currentWeather.weather[0].main);

    weatherDisplay.html(`
        <h1 class="display-5">${cityName} ${weatherEmoji}</h1>
        <p>Temp: ${currentWeather.main.temp}°F</p>
        <p>Wind: ${currentWeather.wind.speed} MPH</p>
        <p>Humidity: ${currentWeather.main.humidity}%</p>
    `);
}

// A function to display the 5-day weather data
function display5DayWeather(data) {
    const weekForecast = $('#week-forecast');  // Container for the 5-day forecast
    weekForecast.empty();  // Clear previous content

    const cityName = data.city.name;

    // Filter to get one forecast per day (e.g., pick noon forecast for each day)
    const dailyForecasts = data.list.filter(forecast => forecast.dt_txt.includes("12:00:00"));

    // Create a card for each day's forecast
    dailyForecasts.forEach((forecast, index) => {
        const date = new Date(forecast.dt_txt).toLocaleDateString();  // Format the date
        const temp = forecast.main.temp;
        const wind = forecast.wind.speed;
        const humidity = forecast.main.humidity;
        const weatherEmoji = getWeatherEmoji(forecast.weather[0].main);  // Get weather emoji

        // Create a card for the day's weather
        const cardHTML = `
            <div class="card" style="width: 18rem; margin: 10px; background-color: #87dced">
                <div class="card-body">
                    <h5 class="card-title">${date}</h5>
                    <h6 class="card-subtitle mb-2 text-muted"> ${weatherEmoji} </h6>
                    <p class="card-text">
                        <strong>Temp:</strong> ${temp}°F <br>
                        <strong>Wind:</strong> ${wind} MPH <br>
                        <strong>Humidity:</strong> ${humidity}% 
                    </p>
                </div>
            </div>
        `;

        // Append the card to the week-forecast container
        weekForecast.append(cardHTML);
    });
}

// Use .on() to listen for the form submission or button click
searchButton.on('click', submitAndFetch);  // For button type="button"

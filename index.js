
const apiKey = "1b3242d2c541f7bfb3a60769abe32b57"; // Replace with your actual API key




const cityNameDisplay = document.querySelector("#currentWeather h2");
const tempDisplay = document.querySelector("#currentWeather p:nth-of-type(1)");
const windDisplay = document.querySelector("#currentWeather p:nth-of-type(2)");
const humidityDisplay = document.querySelector("#currentWeather p:nth-of-type(3)");
const iconImg = document.querySelector("#imagecoontent img");
const weatherDesc = document.querySelector("#imagecoontent p");
const forecastDivs = document.querySelectorAll(".dayforcast");
const searchBtn = document.getElementById("searchBtn");

const locationBtn = document.getElementById("currentLocBtn");
// EVENT LISTENERS
searchBtn.addEventListener("click", () => {
  const cityInput = document.getElementById("cityname");
  const city = cityInput.value.trim();
  getWeatherByCity(city);
});

locationBtn.addEventListener("click", getWeatherByLocation);

// Helper: Format date
function formatDate(date) {
  return `${date.getDate()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getFullYear()).slice(-2)}`;
}

// Fetch weather by city name
async function getWeatherByCity(city) {
  if (!city) {
    alert("Please enter a city name");
    return;
  }

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );
    if (!res.ok) throw new Error("City not found");

    const data = await res.json();
    console.log(data);
    displayWeather(data);
    saveCity(city);
    getForecast(city);
  } catch (error) {
    alert("Error fetching weather: " + error.message);
  }
}

// Fetch weather by geolocation
function getWeatherByLocation() {
  navigator.geolocation.getCurrentPosition(async (pos) => {
    console.log(pos.coords);
    const { latitude, longitude } = pos.coords;
        console.log(latitude, longitude);
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`
      );
      const data = await res.json();
      displayWeather(data);
      saveCity(data.name);
      getForecast(data.name);
    } catch (error) {
      console.log(error)
      alert("Location fetch failed");
    }
  }, () => {
    alert("Location permission denied");
  });
}

// Update the DOM with current weather
function displayWeather(data) {
  const city = data.name;
  const temp = data.main.temp;
  const wind = data.wind.speed;
  const humidity = data.main.humidity;
  const icon = data.weather[0].icon;
  const desc = data.weather[0].description;
  const today = new Date();

  console.log(data);

  cityNameDisplay.textContent = `${city} (${formatDate(today)})`;
  tempDisplay.innerHTML = `Temperature: ${temp.toFixed(1)}<sup>0</sup>C`;
  windDisplay.textContent = `Wind: ${wind} M/S`;
  humidityDisplay.textContent = `Humidity: ${humidity}%`;
  iconImg.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
  iconImg.alt = desc;
  weatherDesc.textContent = desc;
}

// Save city to local storage
function saveCity(city) {
  let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  cities = [city, ...cities.filter(c => c !== city)].slice(0, 5);
  localStorage.setItem("recentCities", JSON.stringify(cities));
}



// Fetch 5-day forecast
async function getForecast(city) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`
    );
    const data = await res.json();
    displayForecast(data);
  } catch (error) {
    console.error("Forecast error:", error);
  }
}

// Display 5-day forecast
function displayForecast(data) {
  const forecastList = data.list;
  const dailyData = {};

  forecastList.forEach(item => {
    const date = item.dt_txt.split(" ")[0];
    if (!dailyData[date] && item.dt_txt.includes("12:00:00")) {
      dailyData[date] = item;
    }
  });

  const entries = Object.values(dailyData).slice(0, 5);

  entries.forEach((item, index) => {
    const div = forecastDivs[index];
    const date = item.dt_txt.split(" ")[0];
    const temp = item.main.temp.toFixed(1);
    const icon = item.weather[0].icon;
    const desc = item.weather[0].description;


    div.innerHTML = `
      <h4>${date}</h4>
      <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}" />
      <p>${desc}</p>
      <p>${temp}°C</p>
    `;
  });
}

addEventListener("DOMContentLoaded", (event) => {
  
getWeatherByLocation();
 })

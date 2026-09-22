import React, { useState } from 'react'

const App = () => {

  // Stores the city typed by the user
  const [city, setCity] = useState("")

  // Stores the weather data
  const [weather, setWeather] = useState(null)


  // Convert Open-Meteo weather code into
  // a readable condition and emoji
  const getWeatherCondition = (code) => {

    if (code === 0) {
      return {
        text: "Clear Sky",
        icon: "☀️"
      }
    }

    if (code >= 1 && code <= 3) {
      return {
        text: "Partly Cloudy",
        icon: "🌤️"
      }
    }

    if (code >= 45 && code <= 48) {
      return {
        text: "Fog",
        icon: "🌫️"
      }
    }

    if (code >= 51 && code <= 57) {
      return {
        text: "Drizzle",
        icon: "🌦️"
      }
    }

    if (code >= 61 && code <= 67) {
      return {
        text: "Rain",
        icon: "🌧️"
      }
    }

    if (code >= 71 && code <= 77) {
      return {
        text: "Snow",
        icon: "❄️"
      }
    }

    if (code >= 80 && code <= 82) {
      return {
        text: "Rain Showers",
        icon: "🌦️"
      }
    }

    if (code >= 85 && code <= 86) {
      return {
        text: "Snow Showers",
        icon: "🌨️"
      }
    }

    if (code >= 95 && code <= 99) {
      return {
        text: "Thunderstorm",
        icon: "⛈️"
      }
    }

    return {
      text: "Unknown",
      icon: "🌡️"
    }
  }

  const formatTime = (time) => {
    const date = new Date(time)

    return date.toLocaleTimeString([], {
      hour: "numeric",
      hour12: true
    })
  }
  const formatDay = (dateString, index) => {

    if (index === 0) {
      return "Today"
    }

    const date = new Date(dateString)

    return date.toLocaleDateString([], {
      weekday: "short"
    })
  }

  // Search for a city and get its weather
  const searchCity = async () => {

    // Don't search if input is empty
    if (city.trim() === "") {
      alert("Please enter a city")
      return
    }

    try {

      // ==========================================
      // STEP 1: Get latitude and longitude
      // ==========================================

      const locationResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
      )

      const locationData = await locationResponse.json()

      console.log("Location data:", locationData)


      // Check if city exists
      if (!locationData.results) {
        alert("City not found")
        return
      }


      // Get the first search result
      const location = locationData.results[0]

      console.log("City:", location.name)
      console.log("Latitude:", location.latitude)
      console.log("Longitude:", location.longitude)


      // ==========================================
      // STEP 2: Get weather information
      // ==========================================

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
      )

      const weatherData = await weatherResponse.json()

      console.log("Weather data:", weatherData)


      // ==========================================
      // STEP 3: Store weather data in state
      // ==========================================

      setWeather({

        city: location.name,
        country: location.country,

        // Current weather
        temperature: weatherData.current.temperature_2m,
        humidity: weatherData.current.relative_humidity_2m,
        windSpeed: weatherData.current.wind_speed_10m,
        weatherCode: weatherData.current.weather_code,

        // Hourly weather
        hourlyTime: weatherData.hourly.time,
        hourlyTemperature: weatherData.hourly.temperature_2m,
        hourlyHumidity: weatherData.hourly.relative_humidity_2m,
        hourlyWind: weatherData.hourly.wind_speed_10m,

        // Daily weather
        dailyTime: weatherData.daily.time,
        dailyMaxTemperature: weatherData.daily.temperature_2m_max,
        dailyMinTemperature: weatherData.daily.temperature_2m_min,
        dailyWeatherCode: weatherData.daily.weather_code

      })

    } catch (error) {

      console.log("Error:", error)

      alert("Something went wrong")

    }
  }


  return (

    <div className="app">

      <div className="weather-card">


        {/* ==========================================
            TITLE
        ========================================== */}

        <h1>
          🌤️ Weather App
        </h1>


        {/* ==========================================
            SEARCH BOX
        ========================================== */}

        <div className="search-box">

          <input
            type="text"
            placeholder="Enter city name"

            value={city}

            onChange={(e) => setCity(e.target.value)}

            onKeyDown={(e) => {

              if (e.key === "Enter") {
                searchCity()
              }

            }}
          />

          <button onClick={searchCity}>
            Search
          </button>

        </div>


        {/* ==========================================
            WEATHER INFORMATION
        ========================================== */}

        {weather && (

          <div className="weather-info">


            {/* City */}

            <h2>
              {weather.city}, {weather.country}
            </h2>


            {/* Weather Icon */}

            <div className="weather-icon">

              {getWeatherCondition(
                weather.weatherCode
              ).icon}

            </div>


            {/* Temperature */}

            <h1 className="temperature">

              {weather.temperature}°C

            </h1>


            {/* Weather Condition */}

            <h3>

              {getWeatherCondition(
                weather.weatherCode
              ).text}

            </h3>


            {/* ==========================================
                CURRENT WEATHER DETAILS
            ========================================== */}

            <div className="details">


              {/* Humidity */}

              <div className="detail-card">

                <span>
                  💧
                </span>

                <p>
                  Humidity
                </p>

                <strong>
                  {weather.humidity}%
                </strong>

              </div>


              {/* Wind */}

              <div className="detail-card">

                <span>
                  💨
                </span>

                <p>
                  Wind Speed
                </p>

                <strong>
                  {weather.windSpeed} km/h
                </strong>

              </div>

            </div>


            {/* ==========================================
                HOURLY FORECAST
            ========================================== */}

            <div className="hourly-forecast">

              <h2>
                Hourly Forecast
              </h2>


              <div className="hourly-container">

                {weather.hourlyTime
                  .map((time, index) => ({ time, index }))
                  .filter(({ time }) => new Date(time) >= new Date())
                  .slice(0, 6)
                  .map(({ time, index }) => (

                    <div
                      className="hourly-card"
                      key={time}
                    >

                      <p>
                        {formatTime(time)}
                      </p>

                      <strong>
                        {weather.hourlyTemperature[index]}°C
                      </strong>

                    </div>

                  ))}

              </div>

            </div>

            <div className="daily-forecast">

              <h2>
                7-Day Forecast
              </h2>

              <div className="daily-container">

                {weather.dailyTime.map((date, index) => {

                  const condition = getWeatherCondition(
                    weather.dailyWeatherCode[index]
                  )

                  return (

                    <div
                      className="daily-card"
                      key={date}
                    >

                      <p className="day">
                        {formatDay(date, index)}
                      </p>

                      <div className="daily-icon">
                        {condition.icon}
                      </div>

                      <p className="daily-condition">
                        {condition.text}
                      </p>

                      <div className="daily-temperature">

                        <strong>
                          {weather.dailyMaxTemperature[index]}°
                        </strong>

                        <span>
                          {weather.dailyMinTemperature[index]}°
                        </span>

                      </div>

                    </div>
                  )

                })}

              </div>

            </div>

          </div>

        )}

      </div>

    </div>

  )
}

export default App
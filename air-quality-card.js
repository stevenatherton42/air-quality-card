class AirQualityCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    // Required for Lovelace UI
    setConfig(config) {
        if (!config.weather_entity || !config.outdoor_temp || !config.outdoor_humidity || !config.chance_of_rain ||
            !config.pollen_count || !config.uv_index || !config.pm25_sensors || !config.temp_sensors || !config.humidity_sensors) {
            throw new Error("Missing required sensor configurations.");
        }

        this.config = config;

        this.shadowRoot.innerHTML = `
            <style>
                .card {
                    padding: 16px;
                    border-radius: 16px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    transition: background 0.3s ease;
                    color: white;
                    font-family: Arial, sans-serif;
                }
                .title {
                    font-size: 18px;
                    font-weight: bold;
                }
                .weather-icon {
                    font-size: 48px;
                    margin-top: 10px;
                }
                .value {
                    font-size: 24px;
                    font-weight: bold;
                    margin-top: 4px;
                }
                .icons {
                    display: flex;
                    gap: 10px;
                    margin-top: 10px;
                }
                .icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                ha-icon {
                    color: white;
                    --mdc-icon-size: 24px;
                }
            </style>
            <ha-card class="card" id="card">
                <div class="title">Weather & Air Quality</div>
                <div class="weather-icon"><ha-icon id="weatherIcon"></ha-icon></div>
                <div id="weatherState" class="value">Loading...</div>
                <div id="outdoorData"></div>
                <div class="icons">
                    <div class="icon"><ha-icon icon="mdi:weather-windy"></ha-icon></div>
                    <div class="icon"><ha-icon icon="mdi:molecule-co2"></ha-icon></div>
                    <div class="icon"><ha-icon icon="mdi:air-filter"></ha-icon></div>
                </div>
            </ha-card>
        `;
    }

    // Fetch sensor values
    set hass(hass) {
        if (!this.config) return;

        // Get weather data
        const weatherState = hass.states[this.config.weather_entity]?.state || "Unknown";
        const weatherIcon = this.getWeatherIcon(weatherState);
        const outdoorTemp = parseFloat(hass.states[this.config.outdoor_temp]?.state) || 0;
        const outdoorHumidity = parseFloat(hass.states[this.config.outdoor_humidity]?.state) || 0;
        const chanceOfRain = parseFloat(hass.states[this.config.chance_of_rain]?.state) || 0;
        const pollenCount = parseFloat(hass.states[this.config.pollen_count]?.state) || 0;
        const uvIndex = parseFloat(hass.states[this.config.uv_index]?.state) || 0;

        // Get indoor air quality sensor averages
        const avgPm25 = this.calculateAverage(hass, this.config.pm25_sensors);
        const avgTemp = this.calculateAverage(hass, this.config.temp_sensors);
        const avgHumidity = this.calculateAverage(hass, this.config.humidity_sensors);

        // Update Weather UI
        this.shadowRoot.querySelector("#weatherIcon").setAttribute("icon", weatherIcon);
        this.shadowRoot.querySelector("#weatherState").textContent = weatherState;

        // Update Outdoor Data
        this.shadowRoot.querySelector("#outdoorData").innerHTML = `
            🌡️ ${outdoorTemp.toFixed(1)}°C | 💧 ${outdoorHumidity}% | 🌧️ ${chanceOfRain}% | 
            🤧 ${pollenCount} Pollen | ☀️ UV ${uvIndex}
        `;

        // Update background color based on PM2.5
        const card = this.shadowRoot.querySelector("#card");
        if (avgPm25 < 50) {
            card.style.background = "linear-gradient(135deg, #4CAF50, #2E7D32)"; // Green (Good)
        } else if (avgPm25 < 100) {
            card.style.background = "linear-gradient(135deg, #FFEB3B, #FBC02D)"; // Yellow (Moderate)
        } else if (avgPm25 < 150) {
            card.style.background = "linear-gradient(135deg, #FF9800, #E65100)"; // Orange (Unhealthy)
        } else {
            card.style.background = "linear-gradient(135deg, #F44336, #B71C1C)"; // Red (Hazardous)
        }
    }

    // Convert weather states to mdi icons
    getWeatherIcon(state) {
        const icons = {
            "clear-night": "mdi:weather-night",
            "cloudy": "mdi:weather-cloudy",
            "fog": "mdi:weather-fog",
            "hail": "mdi:weather-hail",
            "lightning": "mdi:weather-lightning",
            "lightning-rainy": "mdi:weather-lightning-rainy",
            "partlycloudy": "mdi:weather-partly-cloudy",
            "pouring": "mdi:weather-pouring",
            "rainy": "mdi:weather-rainy",
            "snowy": "mdi:weather-snowy",
            "snowy-rainy": "mdi:weather-snowy-rainy",
            "sunny": "mdi:weather-sunny",
            "windy": "mdi:weather-windy",
            "windy-variant": "mdi:weather-windy-variant"
        };
        return icons[state.toLowerCase()] || "mdi:weather-cloudy";
    }

    // Calculate average of multiple sensors
    calculateAverage(hass, sensors) {
        if (!sensors || sensors.length === 0) return 0;
        let sum = 0;
        let count = 0;
        sensors.forEach(sensor => {
            const value = parseFloat(hass.states[sensor]?.state);
            if (!isNaN(value)) {
                sum += value;
                count++;
            }
        });
        return count > 0 ? sum / count : 0;
    }

    getCardSize() {
        return 3;
    }
}

customElements.define("air-quality-card", AirQualityCard);


if (!customElements.get("air-quality-card-editor")) {
    customElements.define("air-quality-card-editor", AirQualityCardEditor);
}

window.customCards = window.customCards || [];
window.customCards.push({
    type: "air-quality-card",
    name: "Air Quality Card",
    description: "Displays air quality and weather data.",
});


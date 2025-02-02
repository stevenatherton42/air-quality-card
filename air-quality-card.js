class AirQualityCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

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
                    color: white;
                    font-family: Arial, sans-serif;
                    background: transparent;
                }
                .top-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    padding: 10px;
                }
                .weather-icon {
                    font-size: 48px;
                }
                .weather-text {
                    font-size: 24px;
                    font-weight: bold;
                    text-transform: capitalize;
                }
                .outdoor-data {
                    text-align: right;
                }
                .grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                    margin-top: 10px;
                }
                .data-box {
                    padding: 10px;
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.2);
                    text-align: center;
                    font-size: 16px;
                    font-weight: bold;
                }
                .bottom-row {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 10px;
                    width: 100%;
                }
                ha-icon {
                    color: white;
                    --mdc-icon-size: 24px;
                    margin-right: 5px;
                }
            </style>
            <ha-card class="card">
                <div class="top-row">
                    <ha-icon id="weatherIcon" class="weather-icon"></ha-icon>
                    <span id="weatherState" class="weather-text">Loading...</span>
                    <div class="outdoor-data">
                        <div><ha-icon icon="mdi:thermometer"></ha-icon> <span id="outdoorTemp">N/A</span>°C</div>
                        <div><ha-icon icon="mdi:water-percent"></ha-icon> <span id="outdoorHumidity">N/A</span>%</div>
                    </div>
                </div>
                <div class="grid">
                    <div class="data-box">AQI: <span id="aqiValue">N/A</span></div>
                    <div class="data-box">UV: <span id="uvIndex">N/A</span></div>
                    <div class="data-box">Pollen: <span id="pollenCount">N/A</span></div>
                </div>
                <div class="bottom-row">
                    <div><ha-icon icon="mdi:factory"></ha-icon> <span id="avgPm25">N/A</span> PM2.5</div>
                    <div><ha-icon icon="mdi:thermometer"></ha-icon> <span id="avgIndoorTemp">N/A</span>°C</div>
                    <div><ha-icon icon="mdi:water-percent"></ha-icon> <span id="avgIndoorHumidity">N/A</span>%</div>
                </div>
            </ha-card>
        `;
    }

    set hass(hass) {
        if (!this.config) return;

        const weatherState = hass.states[this.config.weather_entity]?.state || "Unknown";
        this.shadowRoot.querySelector("#weatherState").textContent = weatherState.charAt(0).toUpperCase() + weatherState.slice(1);
        this.shadowRoot.querySelector("#weatherIcon").setAttribute("icon", this.getWeatherIcon(weatherState));
        this.shadowRoot.querySelector("#outdoorTemp").textContent = hass.states[this.config.outdoor_temp]?.state || "N/A";
        this.shadowRoot.querySelector("#outdoorHumidity").textContent = hass.states[this.config.outdoor_humidity]?.state || "N/A";
        this.shadowRoot.querySelector("#pollenCount").textContent = hass.states[this.config.pollen_count]?.state || "N/A";
        this.shadowRoot.querySelector("#uvIndex").textContent = hass.states[this.config.uv_index]?.state || "N/A";
        
        const avgPm25 = this.calculateAverage(hass, this.config.pm25_sensors);
        const avgTemp = this.calculateAverage(hass, this.config.temp_sensors);
        const avgHumidity = this.calculateAverage(hass, this.config.humidity_sensors);

        this.shadowRoot.querySelector("#aqiValue").textContent = avgPm25;
        this.shadowRoot.querySelector("#avgPm25").textContent = avgPm25;
        this.shadowRoot.querySelector("#avgIndoorTemp").textContent = avgTemp;
        this.shadowRoot.querySelector("#avgIndoorHumidity").textContent = avgHumidity;
    }

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

    calculateAverage(hass, sensors) {
        if (!sensors || !Array.isArray(sensors) || sensors.length === 0) return "N/A";
        let sum = 0, count = 0;
        sensors.forEach(sensor => {
            if (hass.states[sensor] && !isNaN(hass.states[sensor].state)) {
                sum += parseFloat(hass.states[sensor].state);
                count++;
            }
        });
        return count > 0 ? (sum / count).toFixed(1) : "N/A";
    }

    getCardSize() {
        return 3;
    }
}

customElements.define("air-quality-card", AirQualityCard);

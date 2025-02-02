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
                .title {
                    font-size: 18px;
                    font-weight: bold;
                }
                .grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                    margin-top: 10px;
                }
                .icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    padding: 4px;
                }
                ha-icon {
                    color: white;
                    --mdc-icon-size: 20px;
                    margin-right: 5px;
                }
            </style>
            <ha-card class="card">
                <div class="title">Weather & Air Quality</div>
                <div class="grid">
                    <div class="icon"><ha-icon icon="mdi:weather-partly-cloudy"></ha-icon> <span id="weatherState">Loading...</span></div>
                    <div class="icon"><ha-icon icon="mdi:thermometer"></ha-icon> <span id="outdoorTemp">N/A</span>°C</div>
                    <div class="icon"><ha-icon icon="mdi:water-percent"></ha-icon> <span id="outdoorHumidity">N/A</span>%</div>
                    <div class="icon"><ha-icon icon="mdi:weather-rainy"></ha-icon> <span id="chanceOfRain">N/A</span>%</div>
                    <div class="icon"><ha-icon icon="mdi:flower"></ha-icon> <span id="pollenCount">N/A</span></div>
                    <div class="icon"><ha-icon icon="mdi:weather-sunny"></ha-icon> UV <span id="uvIndex">N/A</span></div>
                    <div class="icon"><ha-icon icon="mdi:factory"></ha-icon> AQI: <span id="aqiValue">N/A</span></div>
                    <div class="icon"><ha-icon icon="mdi:thermometer"></ha-icon> <span id="avgIndoorTemp">N/A</span>°C</div>
                    <div class="icon"><ha-icon icon="mdi:water-percent"></ha-icon> <span id="avgIndoorHumidity">N/A</span>%</div>
                </div>
            </ha-card>
        `;
    }

    set hass(hass) {
        if (!this.config) return;

        this.shadowRoot.querySelector("#weatherState").textContent = hass.states[this.config.weather_entity]?.state || "Unknown";
        this.shadowRoot.querySelector("#outdoorTemp").textContent = hass.states[this.config.outdoor_temp]?.state || "N/A";
        this.shadowRoot.querySelector("#outdoorHumidity").textContent = hass.states[this.config.outdoor_humidity]?.state || "N/A";
        this.shadowRoot.querySelector("#chanceOfRain").textContent = hass.states[this.config.chance_of_rain]?.state || "N/A";
        this.shadowRoot.querySelector("#pollenCount").textContent = hass.states[this.config.pollen_count]?.state || "N/A";
        this.shadowRoot.querySelector("#uvIndex").textContent = hass.states[this.config.uv_index]?.state || "N/A";
        
        const avgPm25 = this.calculateAverage(hass, this.config.pm25_sensors);
        const avgTemp = this.calculateAverage(hass, this.config.temp_sensors);
        const avgHumidity = this.calculateAverage(hass, this.config.humidity_sensors);

        this.shadowRoot.querySelector("#aqiValue").textContent = avgPm25;
        this.shadowRoot.querySelector("#avgIndoorTemp").textContent = avgTemp;
        this.shadowRoot.querySelector("#avgIndoorHumidity").textContent = avgHumidity;
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

if (!customElements.get("air-quality-card-editor")) {
    customElements.define("air-quality-card-editor", AirQualityCardEditor);
}

window.customCards = window.customCards || [];
window.customCards.push({
    type: "air-quality-card",
    name: "Air Quality Card",
    description: "Displays air quality and weather data.",
    preview: true
});

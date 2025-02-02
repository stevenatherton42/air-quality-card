class AirQualityCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    // Required method for Lovelace
    setConfig(config) {
        if (!config.outdoor_sensor || !config.pm25_sensor || !config.co2_sensor || !config.voc_sensor) {
            throw new Error("You need to define sensors in the card configuration.");
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
                <div class="title">${config.title || "Air Quality"}</div>
                <div class="value" id="aqiValue">Loading...</div>
                <div class="icons">
                    <div class="icon"><ha-icon icon="mdi:weather-windy"></ha-icon></div>
                    <div class="icon"><ha-icon icon="mdi:molecule-co2"></ha-icon></div>
                    <div class="icon"><ha-icon icon="mdi:air-filter"></ha-icon></div>
                </div>
            </ha-card>
        `;
    }

    // Update sensor values
    set hass(hass) {
        if (!this.config) return;

        // Get air quality sensor values
        const outdoor = parseFloat(hass.states[this.config.outdoor_sensor]?.state) || 0;
        const pm25 = parseFloat(hass.states[this.config.pm25_sensor]?.state) || 0;
        const co2 = parseFloat(hass.states[this.config.co2_sensor]?.state) || 0;
        const voc = parseFloat(hass.states[this.config.voc_sensor]?.state) || 0;

        // Calculate an overall air quality index (simple avg for now)
        let airQualityIndex = (outdoor + pm25 + co2 / 10 + voc / 10) / 4;

        // Set AQI text
        this.shadowRoot.querySelector("#aqiValue").textContent = `AQI: ${airQualityIndex.toFixed(1)}`;

        // Change background color based on air quality
        const card = this.shadowRoot.querySelector("#card");
        if (airQualityIndex < 50) {
            card.style.background = "linear-gradient(135deg, #4CAF50, #2E7D32)"; // Green (Good)
        } else if (airQualityIndex < 100) {
            card.style.background = "linear-gradient(135deg, #FFEB3B, #FBC02D)"; // Yellow (Moderate)
        } else if (airQualityIndex < 150) {
            card.style.background = "linear-gradient(135deg, #FF9800, #E65100)"; // Orange (Unhealthy for Sensitive)
        } else {
            card.style.background = "linear-gradient(135deg, #F44336, #B71C1C)"; // Red (Unhealthy)
        }
    }

    getCardSize() {
        return 2;
    }
}

// Register custom element
customElements.define("air-quality-card", AirQualityCard);


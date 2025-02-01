class AirQualityCard extends HTMLElement {
    set hass(hass) {
        if (!this.content) {
            this.content = document.createElement('div');
            this.content.innerHTML = `
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
                    <div class="title">Air Quality</div>
                    <div class="value" id="aqiValue">Loading...</div>
                    <div class="icons">
                        <div class="icon"><ha-icon icon="mdi:weather-windy"></ha-icon></div>
                        <div class="icon"><ha-icon icon="mdi:molecule-co2"></ha-icon></div>
                        <div class="icon"><ha-icon icon="mdi:air-filter"></ha-icon></div>
                    </div>
                </ha-card>
            `;
            this.appendChild(this.content);
        }

        // Get air quality sensor values
        const outdoor = parseFloat(hass.states["sensor.outdoor_air_quality"]?.state) || 0;
        const pm25 = parseFloat(hass.states["sensor.living_room_pm25"]?.state) || 0;
        const co2 = parseFloat(hass.states["sensor.bedroom_co2"]?.state) || 0;
        const voc = parseFloat(hass.states["sensor.kitchen_voc"]?.state) || 0;

        // Calculate an overall air quality index (simple avg for now)
        let airQualityIndex = (outdoor + pm25 + co2 / 10 + voc / 10) / 4;

        // Set AQI text
        this.content.querySelector("#aqiValue").textContent = `AQI: ${airQualityIndex.toFixed(1)}`;

        // Change background color based on air quality
        const card = this.content.querySelector("#card");
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

customElements.define("air-quality-card", AirQualityCard);

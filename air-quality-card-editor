class AirQualityCardEditor extends HTMLElement {
    constructor() {
        super();
        this.config = {};
    }

    setConfig(config) {
        this.config = config;
        this.render();
    }

    render() {
        if (this.shadowRoot) this.shadowRoot.innerHTML = "";
        const root = this.attachShadow({ mode: "open" });

        root.innerHTML = `
            <style>
                .card-config {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    padding: 10px;
                }
                label {
                    font-weight: bold;
                    margin-top: 10px;
                }
                select, input {
                    padding: 5px;
                    font-size: 14px;
                    width: 100%;
                }
            </style>
            <div class="card-config">
                <label>Weather Entity:</label>
                <input id="weather_entity" type="text" value="${this.config.weather_entity || ''}" placeholder="weather.home">
                
                <label>Outdoor Temperature Sensor:</label>
                <input id="outdoor_temp" type="text" value="${this.config.outdoor_temp || ''}" placeholder="sensor.outdoor_temperature">

                <label>Outdoor Humidity Sensor:</label>
                <input id="outdoor_humidity" type="text" value="${this.config.outdoor_humidity || ''}" placeholder="sensor.outdoor_humidity">

                <label>Chance of Rain Sensor:</label>
                <input id="chance_of_rain" type="text" value="${this.config.chance_of_rain || ''}" placeholder="sensor.chance_of_rain">

                <label>Pollen Count Sensor:</label>
                <input id="pollen_count" type="text" value="${this.config.pollen_count || ''}" placeholder="sensor.pollen_count">

                <label>UV Index Sensor:</label>
                <input id="uv_index" type="text" value="${this.config.uv_index || ''}" placeholder="sensor.uv_index">

                <label>PM2.5 Sensors (comma-separated):</label>
                <input id="pm25_sensors" type="text" value="${(this.config.pm25_sensors || []).join(', ')}" placeholder="sensor.pm25_1, sensor.pm25_2">

                <label>Temperature Sensors (comma-separated):</label>
                <input id="temp_sensors" type="text" value="${(this.config.temp_sensors || []).join(', ')}" placeholder="sensor.indoor_temp_1, sensor.indoor_temp_2">

                <label>Humidity Sensors (comma-separated):</label>
                <input id="humidity_sensors" type="text" value="${(this.config.humidity_sensors || []).join(', ')}" placeholder="sensor.humidity_1, sensor.humidity_2">
            </div>
        `;

        // Attach event listeners to input fields
        root.querySelectorAll("input").forEach(input => {
            input.addEventListener("change", (event) => this._valueChanged(event));
        });
    }

    _valueChanged(event) {
        if (!this.config || !this.configChanged) return;
        const key = event.target.id;
        let value = event.target.value;
        
        if (key.includes("_sensors")) {
            value = value.split(",").map(v => v.trim());
        }
        
        this.config[key] = value;
        this.configChanged(this.config);
    }

    setConfigChangedCallback(callback) {
        this.configChanged = callback;
    }
}

customElements.define("air-quality-card-editor", AirQualityCardEditor);

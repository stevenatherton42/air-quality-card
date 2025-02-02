import { LitElement, html, css } from 'lit-element';
import { styleMap } from 'lit-html/directives/style-map.js';

class CompactAirQualityCard extends LitElement {
  static get properties() {
    return {
      hass: {},
      config: {},
    };
  }

  static get styles() {
    return css`
      .card {
        padding: 12px;
        background: var(--card-background-color);
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .weather {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .weather-icon {
        font-size: 32px;
      }
      .weather-details {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .row {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .icon {
        font-size: 20px;
      }
      .value {
        color: var(--primary-text-color);
      }
      .uv-high {
        color: red;
      }
      .uv-low {
        color: green;
      }
    `;
  }

  render() {
    if (!this.hass || !this.config) {
      return html``;
    }

    const {
      weather_entity,
      outdoor_temp,
      outdoor_humidity,
      chance_of_rain,
      pollen_count,
      uv_index,
      indoor_sensors,
    } = this.config;

    // Weather Data
    const weatherState = this.hass.states[weather_entity].state;
    const weatherIcon = this.hass.states[weather_entity].attributes.icon;
    const outdoorTemp = this.hass.states[outdoor_temp].state;
    const outdoorHumidity = this.hass.states[outdoor_humidity].state;
    const rainChance = this.hass.states[chance_of_rain].state;
    const pollen = this.hass.states[pollen_count].state;
    const uv = this.hass.states[uv_index].state;

    // Indoor Data (Average)
    const indoorTemp = indoor_sensors
      .map((sensor) => parseFloat(this.hass.states[sensor.temp].state))
      .reduce((a, b) => a + b, 0) / indoor_sensors.length;

    const indoorHumidity = indoor_sensors
      .map((sensor) => parseFloat(this.hass.states[sensor.humidity].state))
      .reduce((a, b) => a + b, 0) / indoor_sensors.length;

    const indoorPM25 = indoor_sensors
      .map((sensor) => parseFloat(this.hass.states[sensor.pm25].state))
      .reduce((a, b) => a + b, 0) / indoor_sensors.length;

    // UV Index Color
    const uvColor = uv > 5 ? 'uv-high' : 'uv-low';

    return html`
      <div class="card">
        <!-- Weather Section -->
        <div class="weather">
          <ha-icon class="weather-icon" .icon=${weatherIcon}></ha-icon>
          <span>${weatherState}</span>
        </div>
        <div class="row">
          <ha-icon class="icon" icon="mdi:thermometer"></ha-icon>
          <span class="value">${outdoorTemp}°C</span>
          <ha-icon class="icon" icon="mdi:water-percent"></ha-icon>
          <span class="value">${outdoorHumidity}%</span>
          <ha-icon class="icon" icon="mdi:weather-rainy"></ha-icon>
          <span class="value">${rainChance}%</span>
          <ha-icon class="icon" icon="mdi:flower"></ha-icon>
          <span class="value">${pollen}</span>
          <ha-icon class="icon" icon="mdi:weather-sunny"></ha-icon>
          <span class="value ${uvColor}">${uv}</span>
        </div>

        <!-- Indoor Air Quality Section -->
        <div class="row">
          <ha-icon class="icon" icon="mdi:home"></ha-icon>
          <ha-icon class="icon" icon="mdi:thermometer"></ha-icon>
          <span class="value">${indoorTemp.toFixed(1)}°C</span>
          <ha-icon class="icon" icon="mdi:water-percent"></ha-icon>
          <span class="value">${indoorHumidity.toFixed(1)}%</span>
          <ha-icon class="icon" icon="mdi:air-filter"></ha-icon>
          <span class="value">${indoorPM25.toFixed(1)} µg/m³</span>
        </div>
      </div>
    `;
  }
}

customElements.define('compact-air-quality-card', CompactAirQualityCard);

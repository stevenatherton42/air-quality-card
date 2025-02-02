export const CONFIG_SCHEMA = {
  type: 'object',
  properties: {
    weather_entity: { type: 'string' },
    outdoor_temp: { type: 'string' },
    outdoor_humidity: { type: 'string' },
    chance_of_rain: { type: 'string' },
    pollen_count: { type: 'string' },
    uv_index: { type: 'string' },
    indoor_sensors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          temp: { type: 'string' },
          humidity: { type: 'string' },
          pm25: { type: 'string' },
        },
        required: ['temp', 'humidity', 'pm25'],
      },
    },
  },
  required: [
    'weather_entity',
    'outdoor_temp',
    'outdoor_humidity',
    'chance_of_rain',
    'pollen_count',
    'uv_index',
    'indoor_sensors',
  ],
};

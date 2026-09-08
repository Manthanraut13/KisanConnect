import { useCallback, useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Cloud, Droplets, Loader2 } from 'lucide-react';
import api from '../../services/api';

const CROPS = [
  'Tomato',
  'Onion',
  'Potato',
  'Carrot',
  'Cabbage',
  'Cauliflower',
  'Spinach',
  'Brinjal',
  'Ladyfinger',
  'Green Chilli',
  'Capsicum',
  'Cucumber',
  'Bottle Gourd',
  'Bitter Gourd',
  'Mango',
  'Banana',
  'Apple',
  'Orange',
  'Wheat',
  'Rice',
];

const DISTRICT_COORDS = {
  nashik: { lat: 19.9615, lon: 73.8087 },
  pune: { lat: 18.5204, lon: 73.8567 },
  'mumbai suburban': { lat: 19.076, lon: 72.8777 },
  mumbai: { lat: 19.076, lon: 72.8777 },
  solapur: { lat: 17.6599, lon: 75.9064 },
  aurangabad: { lat: 19.8762, lon: 75.3433 },
  nagpur: { lat: 21.1458, lon: 79.0882 },
  'coimbatore': { lat: 11.0168, lon: 76.9558 },
  ludhiana: { lat: 30.901, lon: 75.8573 },
  lucknow: { lat: 26.8467, lon: 80.9462 },
  indore: { lat: 22.7196, lon: 75.8577 },
};

const DEFAULT_COORDS = { lat: 20.5937, lon: 78.9629 };

function mockForecast(crop, days) {
  const basePrice = { Tomato: 35, Onion: 30, Potato: 22 }[crop] ?? 28;
  return Array.from({ length: days }).map((_, i) => {
    const price = basePrice + Math.sin(i / 2) * 3 + i * 0.4;
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      date: date.toISOString().slice(0, 10),
      predicted_price: Number(price.toFixed(2)),
      upper_bound: Number((price + 4).toFixed(2)),
      lower_bound: Number(Math.max(0, price - 4).toFixed(2)),
    };
  });
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0]?.payload;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2 text-sm">
      <p className="font-medium">{label}</p>
      {point && (
        <>
          <p>Price: ₹{point.predicted_price}/kg</p>
          <p className="text-gray-600">Range: ₹{point.lower_bound}–{point.upper_bound}</p>
        </>
      )}
    </div>
  );
}

export default function DemandAdvisory() {
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [forecastDays, setForecastDays] = useState(7);
  const [forecastData, setForecastData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [forecastLoading, setForecastLoading] = useState(false);

  const getForecast = useCallback(async (cropName, days) => {
    setForecastLoading(true);
    try {
      const res = await api.post('/ai/forecast/demand', {
        crop_name: cropName,
        forecast_days: days,
      });
      setForecastData(res.data ?? res);
    } catch {
      setForecastData({
        forecast: mockForecast(cropName, days),
        advisory: 'Prices should remain stable over the coming days. ' +
          'Consider selling within 72 hours to lock in current rates.',
      });
    } finally {
      setForecastLoading(false);
    }
  }, []);

  useEffect(() => {
    getForecast(selectedCrop, forecastDays);
  }, [selectedCrop, forecastDays, getForecast]);

  useEffect(() => {
    let cancelled = false;
    const loadWeather = async () => {
      setWeatherLoading(true);
      try {
        let district = '';
        try {
          const meRes = await api.get('/api/users/me');
          const me = meRes.data ?? meRes;
          district = (me.farmerProfile?.district || '').toLowerCase();
        } catch {
          /* fall back to default coords */
        }
        const coords =
          DISTRICT_COORDS[district] || DEFAULT_COORDS;
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,precipitation&daily=precipitation_probability_max&forecast_days=1&timezone=auto`
        );
        const data = await res.json();
        if (cancelled) return;
        setWeatherData({
          temperature: data.current?.temperature_2m,
          rainChance: data.daily?.precipitation_probability_max?.[0],
          district: district || 'your district',
        });
      } catch {
        if (!cancelled) setWeatherData(null);
      } finally {
        if (!cancelled) setWeatherLoading(false);
      }
    };
    loadWeather();
    return () => {
      cancelled = true;
    };
  }, []);

  const forecast = Array.isArray(forecastData?.forecast) ? forecastData.forecast : [];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-green-800">Demand &amp; Price Advisory</h1>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <select
          value={selectedCrop}
          onChange={(e) => setSelectedCrop(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
        >
          {CROPS.map((crop) => (
            <option key={crop} value={crop}>
              {crop}
            </option>
          ))}
        </select>

        <div className="inline-flex rounded-lg overflow-hidden border border-gray-300">
          {[7, 30].map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => setForecastDays(days)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                forecastDays === days
                  ? 'bg-green-700 text-white'
                  : 'bg-white text-gray-700 hover:bg-green-50'
              }`}
            >
              {days} Day
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-gray-800">
            {selectedCrop} — {forecastDays}-Day Price Forecast
          </h2>
          {forecastLoading && <Loader2 className="h-4 w-4 animate-spin text-green-700" />}
        </div>
        {forecast.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={forecast} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="band" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2D7A2D" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#2D7A2D" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis dataKey="predicted_price" tickFormatter={(v) => `₹${v}`} />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="upper_bound"
                stroke="none"
                fill="none"
              />
              <Area
                type="monotone"
                dataKey="lower_bound"
                stroke="none"
                fill="none"
              />
              <Area
                type="monotone"
                dataKey="predicted_price"
                stroke="#2D7A2D"
                strokeWidth={2}
                fill="url(#band)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[350px] flex items-center justify-center text-gray-400">
            Loading forecast...
          </div>
        )}
      </div>

      {forecastData?.advisory && (
        <div className="border border-green-300 bg-green-50 text-green-900 rounded-xl px-4 py-4">
          <p className="font-semibold mb-1">Advisory</p>
          {forecastData.advisory}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 text-gray-800 font-semibold mb-3">
          <Cloud className="h-5 w-5 text-green-700" />
          Weather in {weatherData?.district || 'your district'}
        </div>
        {weatherLoading ? (
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" /> Fetching weather...
          </div>
        ) : weatherData ? (
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-green-700">
                {Math.round(weatherData.temperature)}°
              </span>
              <span className="text-gray-600">C</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Droplets className="h-5 w-5 text-blue-600" />
              Rain chance: {weatherData.rainChance ?? 0}%
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400">Weather data unavailable</p>
        )}
      </div>
    </div>
  );
}
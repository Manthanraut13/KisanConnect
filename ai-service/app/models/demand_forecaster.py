# DemandForecaster class utilizing Meta Prophet for crop price and demand predictions
import logging
import pandas as pd
from prophet import Prophet
from app.utils.data_loader import get_crop_data

logger = logging.getLogger(__name__)

class DemandForecaster:
    """
    Predicts crop demand and price trends using Meta Prophet time-series forecasting.
    Includes automatic multi-tier fallback (Prophet -> Moving Average -> Static Default).
    """

    def predict(self, crop_name: str, district: str, days_ahead: int = 7) -> dict:
        """
        Generate a multi-day forecast for a crop in a given district.
        """
        try:
            df = get_crop_data(crop_name, district)
            if df is None or len(df) < 30:
                logger.warning(f"Insufficient historical data for {crop_name} in {district}. Using moving average fallback.")
                return self._moving_average_predict(crop_name, district, days_ahead)

            # Prepare dataset for Prophet (requires 'ds' date and 'y' target columns)
            prophet_df = df[['date', 'price_per_kg']].rename(columns={'date': 'ds', 'price_per_kg': 'y'})
            prophet_df['ds'] = pd.to_datetime(prophet_df['ds'])

            # Fit Meta Prophet model with seasonality
            model = Prophet(
                yearly_seasonality=True,
                weekly_seasonality=True,
                daily_seasonality=False,
                changepoint_prior_scale=0.1,
                interval_width=0.80
            )
            model.fit(prophet_df)

            # Create future dates dataframe
            future = model.make_future_dataframe(periods=days_ahead)
            forecast = model.predict(future)

            # Get recent 30-day average for demand index comparison
            historical_avg = df['price_per_kg'].tail(30).mean()
            recent_forecast = forecast.tail(days_ahead)

            forecast_list = []
            predicted_prices = []

            for _, row in recent_forecast.iterrows():
                pred_price = round(float(row['yhat']), 2)
                lower = round(float(row['yhat_lower']), 2)
                upper = round(float(row['yhat_upper']), 2)
                demand_idx = self._calculate_demand_index(pred_price, historical_avg)

                predicted_prices.append(pred_price)
                forecast_list.append({
                    "date": row['ds'].strftime("%Y-%m-%d"),
                    "predicted_price": pred_price,
                    "lower_bound": lower,
                    "upper_bound": upper,
                    "demand_index": demand_idx,
                    "confidence": 0.85
                })

            advisory = self._generate_advisory(predicted_prices, historical_avg, crop_name, district)

            return {
                "crop_name": crop_name,
                "district": district,
                "forecast": forecast_list,
                "advisory": advisory,
                "model_version": "prophet-v1.1"
            }

        except Exception as e:
            logger.error(f"Prophet prediction failed for {crop_name}/{district}: {str(e)}. Triggering fallback.")
            return self._moving_average_predict(crop_name, district, days_ahead)

    def _moving_average_predict(self, crop_name: str, district: str, days_ahead: int = 7) -> dict:
        """Secondary fallback using 14-day rolling moving average."""
        try:
            df = get_crop_data(crop_name, district, min_records=1)
            if df is None or len(df) == 0:
                return self._static_forecast(crop_name, district, days_ahead)

            avg_price = round(float(df['price_per_kg'].tail(14).mean()), 2)
            last_date = pd.to_datetime(df['date'].iloc[-1])

            forecast_list = []
            for i in range(1, days_ahead + 1):
                f_date = (last_date + pd.Timedelta(days=i)).strftime("%Y-%m-%d")
                forecast_list.append({
                    "date": f_date,
                    "predicted_price": avg_price,
                    "lower_bound": round(avg_price * 0.90, 2),
                    "upper_bound": round(avg_price * 1.10, 2),
                    "demand_index": 50,
                    "confidence": 0.50
                })

            return {
                "crop_name": crop_name,
                "district": district,
                "forecast": forecast_list,
                "advisory": f"Prices for {crop_name} in {district} are expected to remain steady around ₹{avg_price}/kg.",
                "model_version": "moving-average-v1.0"
            }
        except Exception:
            return self._static_forecast(crop_name, district, days_ahead)

    def _static_forecast(self, crop_name: str, district: str, days_ahead: int = 7) -> dict:
        """Tertiary fallback supplying safe default values."""
        base_price = 20.0
        today = pd.Timestamp.now()

        forecast_list = []
        for i in range(1, days_ahead + 1):
            f_date = (today + pd.Timedelta(days=i)).strftime("%Y-%m-%d")
            forecast_list.append({
                "date": f_date,
                "predicted_price": base_price,
                "lower_bound": 16.0,
                "upper_bound": 24.0,
                "demand_index": 50,
                "confidence": 0.20
            })

        return {
            "crop_name": crop_name,
            "district": district,
            "forecast": forecast_list,
            "advisory": f"Standard market advisory for {crop_name} in {district}.",
            "model_version": "static-fallback-v1.0"
        }

    def _calculate_demand_index(self, predicted_price: float, historical_avg: float) -> int:
        """Calculate a 0-100 demand index based on price ratio."""
        if historical_avg <= 0:
            return 50
        ratio = predicted_price / historical_avg
        if ratio >= 1.20:
            return int(min(100, 85 + (ratio - 1.20) * 50))
        elif ratio >= 1.10:
            return int(70 + (ratio - 1.10) * 150)
        elif ratio >= 0.90:
            return int(40 + (ratio - 0.90) * 150)
        else:
            return int(max(10, 40 - (0.90 - ratio) * 100))

    def _generate_advisory(self, predicted_prices: list, historical_avg: float, crop_name: str, district: str) -> str:
        """Generate human-readable crop marketing advisory."""
        if not predicted_prices or historical_avg <= 0:
            return f"Demand for {crop_name} in {district} remains active."

        avg_pred = sum(predicted_prices) / len(predicted_prices)
        diff_pct = ((avg_pred - historical_avg) / historical_avg) * 100

        if diff_pct > 10:
            return f"{crop_name} prices in {district} are expected to rise by ~{int(diff_pct)}% over the next week. Good time for farmers to harvest and sell."
        elif diff_pct < -10:
            return f"{crop_name} prices in {district} may experience a ~{abs(int(diff_pct))}% drop. Consider storage or immediate local sales."
        else:
            return f"{crop_name} prices in {district} are expected to remain stable near ₹{round(avg_pred, 1)}/kg over the coming week."

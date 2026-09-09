# PriceRecommender class for optimal produce listing price recommendations
import logging
import pandas as pd
from app.utils.data_loader import get_crop_data

logger = logging.getLogger(__name__)

class PriceRecommender:
    """
    Calculates recommended selling price range for farmers based on recent mandi prices,
    quality grade, organic certification, and volume.
    """

    def recommend(self, crop_name: str, district: str, quantity_kg: float, quality_grade: str = 'B', is_organic: bool = False, harvest_date: str = None) -> dict:
        """
        Recommend listing price range (min, recommended, max).
        """
        try:
            df = get_crop_data(crop_name, district, min_records=7)
            if df is None or len(df) == 0:
                logger.warning(f"No historical data for price recommendation: {crop_name}/{district}. Using fallback.")
                return self._static_recommend(crop_name)

            # Get recent 30 days data
            recent_dates = df['date'].max() - pd.Timedelta(days=30)
            recent_df = df[df['date'] >= recent_dates]
            if recent_df.empty:
                recent_df = df.tail(30)

            base_price = float(recent_df['price_per_kg'].mean())

            # Apply quality grade adjustment
            grade_multipliers = {'A': 1.15, 'B': 1.00, 'C': 0.90}
            grade_adj = grade_multipliers.get(str(quality_grade).upper(), 1.00)

            # Apply organic premium (+20%)
            organic_adj = 1.20 if is_organic else 1.00

            # Apply bulk volume discount (-5% for > 500kg)
            quantity_adj = 0.95 if float(quantity_kg) > 500 else 1.00

            recommended = base_price * grade_adj * organic_adj * quantity_adj
            min_price = base_price * 0.85
            max_price = base_price * 1.30

            rationale = f"Based on 30-day {district} mandi average (₹{round(base_price, 2)}/kg) for Grade {quality_grade} {crop_name}"
            if is_organic:
                rationale += " with +20% organic premium"
            if float(quantity_kg) > 500:
                rationale += " and bulk volume adjustment"

            return {
                "min_price": round(min_price, 2),
                "recommended_price": round(recommended, 2),
                "max_price": round(max_price, 2),
                "current_market_avg": round(base_price, 2),
                "rationale": rationale
            }

        except Exception as e:
            logger.error(f"Error in price recommendation for {crop_name}/{district}: {str(e)}")
            return self._static_recommend(crop_name)

    def _static_recommend(self, crop_name: str) -> dict:
        """Fallback static price recommendation."""
        return {
            "min_price": 10.0,
            "recommended_price": 15.0,
            "max_price": 22.0,
            "current_market_avg": 14.5,
            "rationale": f"Default fallback market estimate for {crop_name}"
        }

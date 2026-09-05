# Script to generate realistic historical mandi price data (Agmarknet format)
import os
import pandas as pd
import numpy as np
from datetime import datetime

# Set random seed for reproducible realistic data
np.random.seed(42)

CROPS_BASE_PRICE = {
    'Tomato': 1500, 'Onion': 1200, 'Potato': 1000, 'Rice': 2800, 'Wheat': 2200,
    'Maize': 1800, 'Chili': 8000, 'Turmeric': 9500, 'Banana': 2000, 'Mango': 3500,
    'Brinjal': 1400, 'Cabbage': 1100, 'Cauliflower': 1300, 'Garlic': 7000, 'Ginger': 6500,
    'Groundnut': 5500, 'Soybean': 4200, 'Coconut': 2500, 'Sugarcane': 350, 'Cotton': 6000
}

DISTRICTS = {
    'Nashik': 'Maharashtra', 'Pune': 'Maharashtra', 'Amritsar': 'Punjab',
    'Ludhiana': 'Punjab', 'Coimbatore': 'Tamil Nadu', 'Mysuru': 'Karnataka',
    'Guntur': 'Andhra Pradesh', 'Jaipur': 'Rajasthan', 'Indore': 'Madhya Pradesh',
    'Varanasi': 'Uttar Pradesh'
}

start_date = datetime(2024, 1, 1)
end_date = datetime(2026, 8, 31)
date_range = pd.date_range(start=start_date, end=end_date, freq='D')

records = []

for district, state in DISTRICTS.items():
    for crop, base_price in CROPS_BASE_PRICE.items():
        # Location specific multiplier
        loc_mult = 1.0 + (hash(district) % 15 - 7) / 100.0
        
        for d in date_range:
            day_of_year = d.dayofyear
            day_of_week = d.dayofweek
            
            # Annual seasonality (sine wave)
            annual_season = np.sin(2 * np.pi * day_of_year / 365.25) * 0.20
            # Weekly variation
            weekly_variation = (day_of_week - 3) * 0.01
            # Random noise
            noise = np.random.normal(0, 0.05)
            
            modal_price = base_price * loc_mult * (1 + annual_season + weekly_variation + noise)
            modal_price = max(base_price * 0.4, min(base_price * 2.5, modal_price))
            
            min_price = modal_price * np.random.uniform(0.85, 0.95)
            max_price = modal_price * np.random.uniform(1.05, 1.20)
            
            records.append({
                'date': d.strftime('%Y-%m-%d'),
                'state': state,
                'district': district,
                'market': f"{district} Main Mandi",
                'commodity': crop,
                'variety': 'Local / Hybrid',
                'min_price': round(min_price, 2),
                'max_price': round(max_price, 2),
                'modal_price': round(modal_price, 2),
                'unit': 'Quintal'
            })

df = pd.DataFrame(records)
output_dir = os.path.join(os.path.dirname(__file__), 'app', 'data')
os.makedirs(output_dir, exist_ok=True)
output_path = os.path.join(output_dir, 'agmarknet_sample.csv')

df.to_csv(output_path, index=False)
print(f"Generated {len(df)} records of Agmarknet historical price data at {output_path}")

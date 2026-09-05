# Utility module for loading and filtering Agmarknet price data with caching
import os
import pandas as pd

_df_cache = None

def get_price_data():
    """
    Load Agmarknet CSV data with in-memory caching for high performance.
    Normalizes modal_price from Rs/quintal to Rs/kg.
    """
    global _df_cache
    if _df_cache is not None:
        return _df_cache
    
    csv_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'agmarknet_sample.csv')
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Agmarknet data file not found at {csv_path}")
        
    df = pd.read_csv(csv_path, parse_dates=['date'])
    df['modal_price'] = pd.to_numeric(df['modal_price'], errors='coerce')
    df = df.dropna(subset=['modal_price', 'date'])
    
    # Convert Rs/quintal to Rs/kg (1 quintal = 100 kg)
    df['price_per_kg'] = df['modal_price'] / 100.0
    
    _df_cache = df
    return df

def get_crop_data(crop_name: str, district: str, min_records: int = 30):
    """
    Get filtered historical price data for a specific crop and district.
    Returns None if dataset records are fewer than min_records (triggers fallback).
    """
    df = get_price_data()
    filtered = df[
        (df['commodity'].str.lower() == crop_name.lower()) &
        (df['district'].str.lower() == district.lower())
    ].sort_values('date')
    
    if len(filtered) < min_records:
        return None  # Fallback signal for Prophet model
        
    return filtered

import json
import os

nb_dir = os.path.join(os.path.dirname(__file__), 'notebooks')
os.makedirs(nb_dir, exist_ok=True)

def create_nb(filename, cells):
    nb = {
        "cells": cells,
        "metadata": {
            "language_info": {"name": "python"}
        },
        "nbformat": 4,
        "nbformat_minor": 2
    }
    with open(os.path.join(nb_dir, filename), 'w', encoding='utf-8') as f:
        json.dump(nb, f, indent=2)

# Notebook 1: EDA
create_nb("01_EDA_Agmarknet.ipynb", [
    {
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "# 01. Agmarknet Exploratory Data Analysis (EDA)\n",
            "**Kisan Connect AI Service — SIH 2026**\n",
            "This notebook explores the 2.5-year historical price dataset across 20 crops and 10 districts."
        ]
    },
    {
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "import pandas as pd\n",
            "import matplotlib.pyplot as plt\n",
            "\n",
            "# Load dataset\n",
            "df = pd.read_csv('../app/data/agmarknet_sample.csv', parse_dates=['date'])\n",
            "print(f\"Total records: {len(df):,}\")\n",
            "print(df.head())"
        ]
    },
    {
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "# Plot Tomato prices in Nashik over time\n",
            "tomato_nashik = df[(df['commodity'] == 'Tomato') & (df['district'] == 'Nashik')].sort_values('date')\n",
            "plt.figure(figsize=(12, 5))\n",
            "plt.plot(tomato_nashik['date'], tomato_nashik['modal_price'] / 100.0, color='green', label='Price per Kg (₹)')\n",
            "plt.title('Tomato Price Trend in Nashik (2024 - 2026)')\n",
            "plt.xlabel('Date')\n",
            "plt.ylabel('Price (₹/kg)')\n",
            "plt.grid(True)\n",
            "plt.legend()\n",
            "plt.show()"
        ]
    }
])

# Notebook 2: Forecasting
create_nb("02_Demand_Forecasting.ipynb", [
    {
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "# 02. Demand Forecasting using Meta Prophet\n",
            "**Kisan Connect AI Service — SIH 2026**\n",
            "Demonstrating time-series forecasting for 7-day crop price predictions."
        ]
    },
    {
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "import pandas as pd\n",
            "from prophet import Prophet\n",
            "\n",
            "# Load crop data\n",
            "df = pd.read_csv('../app/data/agmarknet_sample.csv', parse_dates=['date'])\n",
            "crop_df = df[(df['commodity'] == 'Tomato') & (df['district'] == 'Nashik')]\n",
            "prophet_df = crop_df[['date', 'modal_price']].rename(columns={'date': 'ds', 'modal_price': 'y'})\n",
            "prophet_df['y'] = prophet_df['y'] / 100.0  # Rs/kg\n",
            "\n",
            "# Fit Prophet\n",
            "model = Prophet(yearly_seasonality=True, weekly_seasonality=True)\n",
            "model.fit(prophet_df)\n",
            "\n",
            "future = model.make_future_dataframe(periods=7)\n",
            "forecast = model.predict(future)\n",
            "print(forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(7))"
        ]
    }
])

# Notebook 3: Route Optimization
create_nb("03_Route_Optimization.ipynb", [
    {
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "# 03. Route Optimization with K-Means & Greedy TSP\n",
            "**Kisan Connect AI Service — SIH 2026**\n",
            "Clustering delivery locations and computing shortest delivery path."
        ]
    },
    {
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "import numpy as np\n",
            "from sklearn.cluster import KMeans\n",
            "\n",
            "# Sample order points around Nashik\n",
            "orders = [\n",
            "    {'id': 1, 'lat': 20.01, 'lng': 73.79},\n",
            "    {'id': 2, 'lat': 19.95, 'lng': 73.75},\n",
            "    {'id': 3, 'lat': 20.05, 'lng': 73.82},\n",
            "    {'id': 4, 'lat': 19.98, 'lng': 73.80}\n",
            "]\n",
            "driver_loc = {'lat': 19.99, 'lng': 73.78}\n",
            "print(f\"Driver start: {driver_loc}\")\n",
            "print(f\"Total orders to optimize: {len(orders)}\")"
        ]
    }
])

print("Jupyter notebooks generated successfully in notebooks/")

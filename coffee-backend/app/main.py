from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://kargin-design.github.io",
    ],
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)

BASE = {
    "coffee": 18,
    "water": 250,
    "time": 94,
    "temp": 95,
    "ratio": 14,
}


def clamp(value: float, min_value: float, max_value: float) -> float:
    return max(min_value, min(value, max_value))


def calc_from_coffee(coffee: float) -> dict:
    water = coffee * BASE["ratio"]
    time = BASE["time"] * (coffee / BASE["coffee"]) ** 0.5
    temp = BASE["temp"] - 0.4 * (coffee - BASE["coffee"])
    temp = clamp(temp, 92, 96)
    bloom = coffee * 3

    return {
        "coffee": round(coffee, 1),
        "water": round(water),
        "time": round(time),
        "temp": round(temp, 1),
        "bloom": round(bloom),
    }


def calc_from_water(water: float) -> dict:
    coffee = water / BASE["ratio"]
    time = BASE["time"] * (coffee / BASE["coffee"]) ** 0.5
    temp = BASE["temp"] - 0.4 * (coffee - BASE["coffee"])
    temp = clamp(temp, 92, 96)
    bloom = coffee * 3

    return {
        "coffee": round(coffee, 1),
        "water": round(water),
        "time": round(time),
        "temp": round(temp, 1),
        "bloom": round(bloom),
    }


@app.get("/api/calc/coffee")
def calc_by_coffee(coffee: float = Query(..., gt=0, le=1000)):
    return calc_from_coffee(coffee)


@app.get("/api/calc/water")
def calc_by_water(water: float = Query(..., gt=0, le=10000)):
    return calc_from_water(water)

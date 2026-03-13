from typing import Optional

from fastapi import FastAPI, Query, HTTPException
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

BASES = {
    "sweet": {
        "coffee": 18,
        "water": 250,
        "time": 94,
        "temp": 95,
        "ratio": 14,
    },
    "balance": {
        "coffee": 18,
        "water": 270,
        "time": 110,
        "temp": 94.5,
        "ratio": 15,
    },
}

RATIO_LIMITS = {"min": 12, "max": 18}
ESPRESSO_SWEET_BASE = {
    "coffee": 18,
    "water": 36,
    "ratio": 2,
    "time": 28,
    "temp": 93.5,
}


def clamp(value: float, min_value: float, max_value: float) -> float:
    return max(min_value, min(value, max_value))


def resolve_base(mode: str) -> dict:
    if mode == "balance":
        return BASES["balance"]
    if mode == "custom":
        return BASES["balance"]
    return BASES["sweet"]


def calc_from_coffee(coffee: float, base: dict) -> dict:
    water = coffee * base["ratio"]
    time = base["time"] * (coffee / base["coffee"]) ** 0.5

    if base is BASES["balance"]:
        temp = base["temp"] + 0.25 * (coffee - base["coffee"])
        temp = clamp(temp, 93, 97)
        bloom = coffee * 2.5
    else:
        temp = base["temp"] - 0.4 * (coffee - base["coffee"])
        temp = clamp(temp, 92, 96)
        bloom = coffee * 3

    return {
        "coffee": round(coffee, 1),
        "water": round(water),
        "time": round(time),
        "temp": round(temp, 1),
        "bloom": round(bloom),
    }


def calc_from_water(water: float, base: dict) -> dict:
    coffee = water / base["ratio"]
    time = base["time"] * (coffee / base["coffee"]) ** 0.5

    if base is BASES["balance"]:
        temp = base["temp"] + 0.25 * (coffee - base["coffee"])
        temp = clamp(temp, 93, 97)
        bloom = coffee * 2.5
    else:
        temp = base["temp"] - 0.4 * (coffee - base["coffee"])
        temp = clamp(temp, 92, 96)
        bloom = coffee * 3

    return {
        "coffee": round(coffee, 1),
        "water": round(water),
        "time": round(time),
        "temp": round(temp, 1),
        "bloom": round(bloom),
    }


def calc_custom(
    coffee: Optional[float],
    water: Optional[float],
    ratio: Optional[float],
) -> dict:
    base = BASES["balance"]

    if ratio is None:
        ratio = base["ratio"]
    ratio = clamp(ratio, RATIO_LIMITS["min"], RATIO_LIMITS["max"])

    if coffee and not water:
        water = coffee * ratio

    if water and not coffee:
        coffee = water / ratio

    if coffee and water:
        ratio = water / coffee
        ratio = clamp(ratio, RATIO_LIMITS["min"], RATIO_LIMITS["max"])

    time = base["time"] * (coffee / base["coffee"]) ** 0.5

    temp = base["temp"] + 0.35 * (ratio - base["ratio"])
    temp = clamp(temp, 92, 97)

    bloom = coffee * 2.7

    return {
        "coffee": round(coffee, 1),
        "water": round(water),
        "ratio": round(ratio, 2),
        "time": round(time),
        "temp": round(temp, 1),
        "bloom": round(bloom),
    }


def calc_espresso_sweet(
    coffee: Optional[float],
    water: Optional[float],
) -> dict:
    base = ESPRESSO_SWEET_BASE

    ratio = base["ratio"]

    if coffee and not water:
        water = coffee * ratio

    if water and not coffee:
        coffee = water / ratio

    time = base["time"] * (coffee / base["coffee"]) ** 0.5

    temp = base["temp"] - 0.2 * (coffee - base["coffee"])
    temp = clamp(temp, 91, 95)

    return {
        "coffee": round(coffee, 1),
        "water": round(water, 1),
        "time": round(time),
        "temp": round(temp, 1),
    }


@app.get("/api/calc/coffee")
def calc_by_coffee(
    coffee: float = Query(..., gt=0, le=1000),
    mode: str = Query("sweet"),
    ratio: Optional[float] = Query(None),
    method: str = Query("v60"),
):
    if method == "espresso":
        if mode != "sweet":
            raise HTTPException(status_code=400, detail="mode not supported")
        return calc_espresso_sweet(coffee, None)
    if mode == "custom":
        return calc_custom(coffee, None, ratio)
    base = resolve_base(mode)
    return calc_from_coffee(coffee, base)


@app.get("/api/calc/water")
def calc_by_water(
    water: float = Query(..., gt=0, le=10000),
    mode: str = Query("sweet"),
    ratio: Optional[float] = Query(None),
    method: str = Query("v60"),
):
    if method == "espresso":
        if mode != "sweet":
            raise HTTPException(status_code=400, detail="mode not supported")
        return calc_espresso_sweet(None, water)
    if mode == "custom":
        return calc_custom(None, water, ratio)
    base = resolve_base(mode)
    return calc_from_water(water, base)


@app.get("/api/calc/custom")
def calc_by_custom(
    coffee: Optional[float] = Query(None, gt=0, le=1000),
    water: Optional[float] = Query(None, gt=0, le=10000),
    ratio: Optional[float] = Query(None),
):
    if coffee is None and water is None:
        raise HTTPException(status_code=400, detail="coffee or water required")
    return calc_custom(coffee, water, ratio)

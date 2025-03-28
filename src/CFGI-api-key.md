## How to use the API Key?

The API URL format is the following:

```
https://cfgi.io/api/api_request.php?api_key=API_KEY&token=TOKEN&start=START&end=END&period=PERIOD
```

- The number of results is limited to **1200 values**.
- The query rate is limited to **1 query every 10 seconds**.
- The following parameters can be used:

### `api_key`
Your API key.

### `token`
The token you want to retrieve historical data for. The enabled tokens are:

`BTC`, `ETH`, `BNB`, `XRP`, `SOL`, `ADA`, `LUNA`, `AVAX`, `DOGE`, `DOT`, `SHIB`, `MATIC`, `CRO`, `TRX`, `XLM`, `LINK`, `UNI`, `FTM`, `ALGO`, `MANA`, `LTC`, `LEO`, `FTT`, `NEAR`, `BCH`, `ETC`, `XMR`, `ATOM`, `VET`, `HBAR`, `FLOW`, `ICP`, `APE`, `EGLD`, `XTZ`, `THETA`, `HNT`, `FIL`, `BSV`, `AXS`, `SAND`, `ZEC`, `EOS`, `IOTA`, `PEPE`, `ARB`, `INJ`, `GRT`, `WIF`, `SUI`, `BGB`, `BONK`, `NOT`, `AAVE`, `JUP`, `SEI`, `GALA`, `BTT`, `TON`, `NEIRO`, `BABYDOGE`, `FET`, `EIGEN`, `OG`, `POLY`, `APU`, `SPX`, `GIGA`, `BITCOIN`, `MOG`, `POPCAT`, `BOBO`, `TET`, `WOJAK`, `KAS`, `MOODENG`, `FLOKI`, `RUNE`, `TRUMP`, `MELANIA`

### `period`
The time interval for the historical data. Allowed values:

- `1`: 15-minute intervals
- `2`: 1-hour intervals
- `3`: 4-hour intervals
- `4`: 1-day intervals

### `start`
The start date of your query.

### `end`
The end date of your query.

### `values` (optional)
The maximum number of values to retrieve from the current date. If set, it overrides the `start` and `end` values. The maximum is **1200 values**.

### `format` (optional)
The date format. Default is `Y-m-d H:i:s`.

---

## Examples

### 1. Query to get BTC data between two given dates (15-minute period)
```
https://cfgi.io/api/api_request.php?api_key=API_KEY&token=BTC&start=2022-10-28 00:00:00&end=2022-10-28 17:00:00&period=1
```

### 2. Query to get the latest 200 values of ETH (1-hour period)
```
https://cfgi.io/api/api_request.php?api_key=API_KEY&token=ETH&values=200&period=2
```

Sample data returned from https://cfgi.io/api/api_request.php?api_key=A7XSolSurfer&token=SOL&period=1&values=500
```
[
  {
    "date": "2025-03-04 03:00:23",
    "price": 136.26,
    "cfgi": 24,
    "data_price": 25.5,
    "data_volatility": 14,
    "data_volume": 15.5,
    "data_impulse": 3,
    "data_technical": 22,
    "data_social": 86.5,
    "data_dominance": 75.5,
    "data_trends": 91.5,
    "datas_whales": 71.5,
    "data_orders": 15
  },
  {
    "date": "2025-03-04 03:00:23",
    "price": 136.26,
    "cfgi": 24,
    "data_price": 25.5,
    "data_volatility": 14,
    "data_volume": 15.5,
    "data_impulse": 3,
    "data_technical": 22,
    "data_social": 86.5,
    "data_dominance": 75.5,
    "data_trends": 91.5,
    "datas_whales": 71.5,
    "data_orders": 15
  },
  {
    "date": "2025-03-04 02:45:20",
    "price": 135.75,
    "cfgi": 24,
    "data_price": 25,
    "data_volatility": 16.5,
    "data_volume": 18,
    "data_impulse": 3,
    "data_technical": 22,
    "data_social": 87,
    "data_dominance": 82,
    "data_trends": 82,
    "datas_whales": 66,
    "data_orders": 15.5
  },
  ...
```
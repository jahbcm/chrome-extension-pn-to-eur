let exchangeRate = 0.24; // fallback

async function updateRate() {
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=EUR&to=PLN');
    const data = await res.json();

    // Check if rate exists
    if (!data.rates || !data.rates.PLN) {
      throw new Error('Rate not found in response: ' + JSON.stringify(data));
    }

    // PLN → EUR
    const exchangeRateLocal = 1 / data.rates.PLN;

    // update global variable
    chrome.storage.local.set({ exchangeRate: exchangeRateLocal });
    exchangeRate = exchangeRateLocal;
    console.log("Updated rate to", exchangeRate);

  } catch (e) {
    console.error("Failed to update rate", e);
  }
}

// update once on start
updateRate();
// refresh every 1 hour
setInterval(updateRate, 1 * 3600 * 1000);

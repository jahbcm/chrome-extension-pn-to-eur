// converter.js
//let exchangeRate = 0.24; // Default rate; can be updated from background

function getExchangeRate() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get("exchangeRate", (data) => {
      if (data.exchangeRate) {
        resolve(data.exchangeRate);
      } else {
        reject("No exchange rate found");
      }
    });
  });
}

async function convertPLNToEUR(text) {
 const exchangeRate = await getExchangeRate();
 const formatEUR = num =>
    num.toLocaleString('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

  return text.replace(
    /(\d{1,3}(?:[ \u00A0]?\d{3})*(?:[.,]\d+)?)(?:\s*[-–—]\s*(\d{1,3}(?:[ \u00A0]?\d{3})*(?:[.,]\d+)?))?\s*(PLN|zł)/gi,
    (match, amount1, amount2, currency) => {
      // Normalize: remove spaces/dots for thousands, convert commas to dots for parsing
      const parseAmount = str =>
        parseFloat(str.replace(/[ \u00A0.]/g, '').replace(',', '.'));

      const eur1 = formatEUR(parseAmount(amount1) * exchangeRate);

      if (amount2) {
        const eur2 = formatEUR(parseAmount(amount2) * exchangeRate);
        return `${amount1} – ${amount2} ${currency} (~${eur1} EUR – ${eur2} EUR)`;
      } 

      else {
        return `${amount1} ${currency} (~${eur1} EUR)`;
      }
      
    }
  );
}

async function convertEURToPLN(eur) {
  const rate = await getExchangeRate();
  return (eur / rate).toFixed(2);
}

async function convertPLNToEURNumber(pln) {
  const rate = await getExchangeRate();
  return (pln * rate).toFixed(2);
}

window.convertPLNToEUR = convertPLNToEUR;
window.convertPLNToEURNumber = convertPLNToEURNumber;
window.convertEURToPLN = convertEURToPLN;
// Export for content and popup scripts
//export { convertPLNToEUR, convertPLNToEURNumber, convertEURToPLN, setExchangeRate };

//import { convertEURToPLN, convertPLNToEURNumber } from "./converter.js";

const plnInput = document.getElementById("plnInput_PLN");
const eurInput = document.getElementById("plnInput_EUR");

// Example exchange rate; you can later fetch live rates
//let exchangeRate = 0.24;

// Flag to prevent infinite loops when updating both inputs
let updating = false;

async function updateValue (functionToCall, input, output) {
  if (updating) return;
  updating = true;
  const value = parseFloat(input.value);
  if (!isNaN(value)) {
    output.value = await functionToCall(value);
  } else {
    output.value = "";
  }
  updating = false;
}

plnInput.addEventListener("input", async () => {
  await updateValue(convertPLNToEURNumber, plnInput, eurInput);
});

eurInput.addEventListener("input", async () => {
    await updateValue(convertEURToPLN, eurInput, plnInput);
});

// Get exchange rate data from JSON file, stored via backend call to API
fetch("exchange_rates.json")
  .then((response) => response.json())
  .then((result) => render(result))
  .catch((error) => console.log("error", error))

// Once exchange data is returned, execute app
let render = (data) => {
  buildOptionLists(data)
  setDefaultSelected()
  addListenersToOptionLists()
  addListenersToOptions(data)
  addListenersToAmount(data)
  preventFormSubmit()
  calculateAmount(data)
  showDate(data)
}

// Generate currency option lists from API data
function buildOptionLists(data) {
  const currencies = Object.keys(data.rates).sort()

  currencies.forEach((currency) => {
    document.querySelectorAll(".options").forEach((option) => {
      const currencyOption = document.createElement("div")
      const currencyText = document.createElement("p")
      const currencyIcon = document.createElement("span")

      currencyOption.classList.add("option", "list-item")
      currencyText.classList.add("currency-text")
      currencyIcon.classList.add(`icon-${currency}`)

      currencyOption.dataset.value = currency
      currencyText.innerHTML = currency

      currencyOption.appendChild(currencyText)
      currencyOption.appendChild(currencyIcon)
      option.appendChild(currencyOption)
    })
  })
}

// Set default currencies selected
function setDefaultSelected() {
  const options = document.querySelectorAll(".options")

  for (let i = 0; i < options.length; i++) {
    const selected = options[i].querySelectorAll(".option")
    selected[i].classList.add("selected")

    const selectTrigger = options[i].parentNode.querySelector(".select-trigger")

    selectTrigger.innerHTML = selected[i].innerHTML
    selectTrigger.dataset.value = selected[i].dataset.value
  }

  document.querySelector(".amount-currency").innerHTML =
    document.getElementById("selectInputCurrency").dataset.value
}

// Event listeners for opening and closing currency lists
function addListenersToOptionLists() {
  const selectWrappers = document.querySelectorAll(".select-wrapper")
  selectWrappers.forEach((wrapper) => {
    const select = wrapper.querySelector(".select")

    wrapper.addEventListener("click", function () {
      select.classList.remove("open")
    })

    wrapper.addEventListener("mouseenter", function () {
      select.classList.add("open")
    })

    wrapper.addEventListener("mouseleave", function () {
      select.classList.remove("open")
    })
  })
}

// Event listeners for changes in currency selection
function addListenersToOptions(data) {
  const options = document.querySelectorAll(".option")
  options.forEach((option) => {
    option.addEventListener("click", function () {
      if (!option.classList.contains("selected")) {
        handleMatchingCurrencies(option)

        option.parentNode
          .querySelector(".selected")
          .classList.remove("selected")

        option.classList.add("selected")

        if (option.parentNode.classList.contains("input")) {
          document.querySelector(".amount-currency").innerHTML =
            option.dataset.value
        }

        const select = option.parentNode.parentNode
        const selectTrigger = select.querySelector(".select-trigger")

        selectTrigger.innerHTML = option.innerHTML
        selectTrigger.dataset.value = option.dataset.value
        select.classList.remove("open")

        calculateAmount(data)
      }
    })
  })
}

// Event listeners for change in amount value, clicker or typed
function addListenersToAmount(data) {
  const amount = document.getElementById("amount")

  amount.addEventListener("keyup", function () {
    calculateAmount(data)
  })

  amount.addEventListener("click", function () {
    calculateAmount(data)
  })
}

// Function to prevent form submission in case of RETURN press
function preventFormSubmit() {
  const form = document.getElementById("currencyConverter")

  form.addEventListener("submit", (event) => {
    event.preventDefault()
  })
}

// Output converted value
function calculateAmount(data) {
  const amount = parseInt(document.getElementById("amount").value)
  const target = document.querySelector(".converted")
  const inputCurrency = document.getElementById("selectInputCurrency").dataset
    .value
  const outputCurrency = document.getElementById("selectOutputCurrency").dataset
    .value

  if (!amount) {
    target.innerHTML = "0.00 " + outputCurrency
    return
  }

  target.innerHTML =
    ((data.rates[outputCurrency] / data.rates[inputCurrency]) * amount).toFixed(
      2
    ) +
    " " +
    outputCurrency
}

// Swap currencies if to and from currencies match
function handleMatchingCurrencies(option) {
  // Determine if input or output list is being altered
  const listOptions =
    option.parentNode.classList.contains("input") === true
      ? ["input", "output"]
      : ["output", "input"]

  if (option.parentNode.classList.contains(listOptions[0])) {
    //The option which is currently selected
    const currentSelected = document.querySelector(
      `.${listOptions[0]} .selected`
    )

    //The option which is currently selected on the other currency list
    const otherSelected = document.querySelector(`.${listOptions[1]} .selected`)

    if (option.dataset.value === otherSelected.dataset.value) {
      //The option on the other list with the same value as the currently selected option on the list being selected from
      const switchedSelection = document.querySelector(
        `[class*="${listOptions[1]}"] [data-value="${currentSelected.dataset.value}"]`
      )

      const optionsListToChange = document.getElementById(
        `select${capitalizeFirstLetter(listOptions[1])}Currency`
      )

      switchedSelection.classList.add("selected")

      //Removes selected class from matched currency on other list
      document
        .querySelector(
          `[class*="${listOptions[1]}"] [data-value="${option.dataset.value}"]`
        )
        .classList.remove("selected")

      //Selects currency trigger from the list not being selected from and reassigns inner html to previously selected option from the list being selected from
      optionsListToChange.innerHTML = switchedSelection.innerHTML

      //Selects currency trigger from the list not being selected from and reassigns data-value to previously selected option from the list being selected from
      optionsListToChange.dataset.value = switchedSelection.dataset.value
    }
  }
}

function showDate(data) {
  const date = new Date(data.timestamp * 1000)
  document.querySelector(".updated-on-time").innerHTML = date.toLocaleString(
    "en-GB",
    { timeZone: "UTC" }
  )
}

// Capitalize first letter of string
// Used to format string in id selector
function capitalizeFirstLetter(string) {
  return string.replace(/^./, string[0].toUpperCase())
}

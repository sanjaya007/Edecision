const yourNameInput = document.getElementById("your-name");
const emailInput = document.getElementById("email");
const postalCodeInput = document.getElementById("postal-code");
const facilityNameInput = document.getElementById("facility-name");
const facilitySizeInput = document.getElementById("facility-size");
const primaryPurposeInput = document.getElementById("primary-purpose");
const peopleInput = document.getElementById("people-no");
const electricityConsumptionInput = document.getElementById(
  "electricity-consumption"
);
const gasConsumptionInput = document.getElementById("gas-consumption");

const allFields = document.querySelectorAll(".form-control");

const section2 = document.querySelector(".section2");
const section3 = document.querySelector(".section3");
const detailsSection = document.querySelector(".details");
const resultBox = document.querySelectorAll(".result-box");

const facilityNameSpan = document.querySelector(".facility-name-span");
const provinceSpan = document.querySelector(".province-span");
const countrySpan = document.querySelector(".country-span");
const postalCodeSpan = document.querySelector(".postal-code-span");
const citySpan = document.querySelector(".city-span");
const ghgElecSpan = document.querySelector(".ghg-elec-span");
const ghgGasSpan = document.querySelector(".ghg-gas-span");
const ghgEmissionSpan = document.querySelector(".ghg-emission-span");
const electricityConsumptionSpan = document.querySelector(
  ".electricity-consumption-span"
);
const heatingSpan = document.querySelector(".heating-span");
const energyIntensitySpan = document.querySelector(".energy-intensity-span");
const carbonIntensitySpan = document.querySelector(".carbon-intensity-span");
const carbonIntensityPersonSpan = document.querySelector(
  ".carbon-intensity-person-span"
);
const pieElecSpan = document.querySelector(".pie-elec");
const pieGasSpan = document.querySelector(".pie-gas");
const pieElecSpan1 = document.querySelector(".pie-elec1");
const pieGasSpan1 = document.querySelector(".pie-gas1");

const barFacilityName = document.querySelectorAll(".bar-facility-name");
const averageBarEUI = document.querySelector(".average-bar-eui");
const averageBarCarbon = document.querySelector(".average-bar-carbon");
const averageBarCarbonPeople = document.querySelector(
  ".average-bar-carbon-people"
);
const euiLastRangeSpan = document.querySelector(".eui-last-range");
const carbonIntensityLastRangeSpan = document.querySelector(
  ".carbon-intensity-last-range"
);
const carbonIntensityPeopleLastRangeSpan = document.querySelector(
  ".carbon-intensity-people-last-range"
);

const caretDown = document.querySelectorAll(".caret-down");
const caretUp = document.querySelectorAll(".caret-up");

const computeBtn = document.querySelector(".compute-btn");

// validation
allFields.forEach((field) => {
  field.addEventListener("input", function (e) {
    if (
      yourNameInput.value.length < 1 ||
      emailInput.value.length < 1 ||
      postalCodeInput.value.length < 1 ||
      facilityNameInput.value.length < 1 ||
      facilitySizeInput.value.length <= 1 ||
      primaryPurposeInput.value.length <= 1 ||
      peopleInput.value.length <= 1 ||
      electricityConsumptionInput.value.length <= 1 ||
      gasConsumptionInput.value.length <= 1
    ) {
      computeBtn.classList.add("disabled-btn");
      computeBtn.setAttribute("disabled", "");
    } else {
      computeBtn.classList.remove("disabled-btn");
      computeBtn.removeAttribute("disabled");
    }
    if (this.getAttribute("id") === "postal-code") {
      this.style.textTransform = "uppercase";
      this.value = this.value
        .replace(/[^\dA-Z]/gi, "")
        .replace(/(.{3})/g, "$1 ")
        .trim();
    }
    if (this.getAttribute("data-type") === "num") {
      this.value = this.value.replace(/[^0-9]/g, "");
    }
  });
});

emailInput.addEventListener("input", function (e) {
  const inputValue = e.target.value;
  const regx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (inputValue.match(regx)) {
    section2.classList.remove("hidden");
  } else {
    section2.classList.add("hidden");
  }
});

let ghgGrid;
let ghgGas;
let siteEUI;
let elecIntensity;
let gasIntensity;
let ghgEmission;

postalCodeInput.addEventListener("input", function (e) {
  facilitySizeInput.value = "";
  peopleInput.value = "";
  electricityConsumptionInput.value = "";
  gasConsumptionInput.value = "";

  const errorText = e.target.parentNode.children[2];
  const inputValue = e.target.value;
  const mappingData = {
    CA: "Canada",
    AB: "Alberta",
    BC: "British Columbia",
    MB: "Manitoba",
    NB: "New Brunswick",
    NL: "Newfoundland and Labrador",
    NT: "Northwest Territories",
    NS: "Nova Scotia",
    NU: "Nunavut",
    ON: "Ontario",
    PE: "Prince Edward Island",
    QC: "Quebec",
    SK: "Saskatchewan",
    YT: "Yukon",
  };
  const fetchData = async () => {
    try {
      // const URL = `http://ec2-3-80-123-193.compute-1.amazonaws.com/ePathServer/api/locations?postalCode=${inputValue}`;
      const URL = `https://edecision.manaknightdigital.com/connector.php?postalCode=${inputValue}`;
      const response = await fetch(URL);
      const data = await response.json();
      if (data && data.country === "CA") {
        section3.classList.remove("hidden");
        detailsSection.classList.remove("hidden");
        facilityNameSpan.innerText = facilityNameInput.value;

        const countryName = data.country;
        const provinceName = data.province;

        provinceSpan.innerText = mappingData[provinceName];
        countrySpan.innerText = mappingData[countryName];

        postalCodeSpan.innerText = inputValue.toUpperCase();
        citySpan.innerText = data.city;
        errorText.innerText = "";
        errorText.classList.remove("invalid-text");

        fetchGHG(data.province);
        fetchEUI(data.country);
      } else {
        section3.classList.add("hidden");
        detailsSection.classList.add("hidden");
        resultBox.forEach((box) => {
          box.classList.add("hidden");
        });
      }
    } catch (err) {
      if (err) {
        section3.classList.add("hidden");
        detailsSection.classList.add("hidden");
        resultBox.forEach((box) => {
          box.classList.add("hidden");
        });
        if (inputValue.length === 7) {
          errorText.innerText = "Please enter a valid postal code !!";
          errorText.classList.add("invalid-text");
        }
      }
    }
  };
  fetchData();
});

const fetchGHG = async (value) => {
  try {
    // const URL = `http://ec2-3-80-123-193.compute-1.amazonaws.com/ePathServer/api/ghg?region=${value}`;
    const URL = `https://edecision.manaknightdigital.com/region.php?region=${value}`;
    const response = await fetch(URL);
    const data = await response.json();
    ghgGrid = data.ghgInGrid;
    ghgGas = data.ghgInGas;
    ghgElecSpan.innerText = data.ghgInGrid + " kg/MWh";
    ghgGasSpan.innerText = data.ghgInGas + " kg/GJ";
  } catch (error) {
    console.log(error);
  }
};

const fetchEUI = async (value) => {
  try {
    // const URL = `http://ec2-3-80-123-193.compute-1.amazonaws.com/ePathServer/api/eui?region=${value}`;
    const URL = `https://edecision.manaknightdigital.com/eui.php?region=${value}`;
    const response = await fetch(URL);
    const data = await response.json();

    const filteredData = data.filter((obj) => obj.propertyType === " Office");

    const opt = document.createElement("option");
    opt.setAttribute("value", filteredData[0].siteEUI);
    opt.setAttribute("elecIntensity", filteredData[0].elecIntensity);
    opt.setAttribute("gasIntensity", filteredData[0].gasIntensity);
    opt.innerText = filteredData[0].propertyType;
    primaryPurposeInput.appendChild(opt);

    siteEUI = filteredData[0].siteEUI;
    elecIntensity = filteredData[0].elecIntensity;
    gasIntensity = filteredData[0].gasIntensity;

    const remainingData = data.filter((obj) => obj.propertyType != " Office");

    remainingData.map((val) => {
      const opt = document.createElement("option");
      opt.setAttribute("value", val.siteEUI);
      opt.setAttribute("elecIntensity", val.elecIntensity);
      opt.setAttribute("gasIntensity", val.gasIntensity);
      opt.innerText = val.propertyType;
      primaryPurposeInput.appendChild(opt);
    });
  } catch (error) {
    console.log(error);
  }
};

primaryPurposeInput.addEventListener("change", function (e) {
  siteEUI = e.target.value;
  elecIntensity = this.options[this.selectedIndex].getAttribute(
    "elecIntensity"
  );
  gasIntensity = this.options[this.selectedIndex].getAttribute("gasIntensity");
});

computeBtn.addEventListener("click", function (e) {
  e.preventDefault();

  calcConsumptionAndEmission();
  calcIntensity();
  calcPie();
  calcPie1();

  resultBox.forEach((box) => {
    box.classList.remove("hidden");
  });
});

// calculate energy consumption and GHG emission
const calcConsumptionAndEmission = () => {
  const electricityConsumptionInputValue = electricityConsumptionInput.value;
  electricityConsumptionSpan.innerText =
    Math.round(electricityConsumptionInputValue / 1000) + " MWh";
  heatingSpan.innerText = gasConsumptionInput.value + " GJ";

  const ghgEmissionValue = Math.round(
    ((electricityConsumptionInputValue / 1000) * ghgGrid +
      gasConsumptionInput.value * ghgGas) /
      1000
  );

  ghgEmission = ghgEmissionValue;
  ghgEmissionSpan.innerText = ghgEmissionValue + " KG";
};

// calculate intensity
const calcIntensity = () => {
  const getBigger = (num1, num2) => {
    return Math.max(num1, num2);
  };

  // energy intensity calculation
  const fixedDecimal = 277.777777;
  const energyUse =
    electricityConsumptionInput.value / fixedDecimal +
    parseFloat(gasConsumptionInput.value);

  const euiFacility = energyUse / facilitySizeInput.value;
  const toFixedEUIFacility = euiFacility.toFixed(2);
  energyIntensitySpan.innerText = toFixedEUIFacility;
  averageBarEUI.innerText = siteEUI;

  const biggerEUI = getBigger(euiFacility, siteEUI);
  const euiLastRange = (120 / 100) * biggerEUI;
  const toFixedEuiLastRange = euiLastRange.toFixed(2);
  euiLastRangeSpan.innerText = toFixedEuiLastRange;

  const euiFacilityPercentage = (euiFacility / euiLastRange) * 90;
  const euiPercentage = (siteEUI / euiLastRange) * 90;

  // carbon intensity and persons
  // carbon intensity
  const carbonIntensityFacility =
    (ghgEmission * 1000) / facilitySizeInput.value;
  const toFixedCarbonIntensityFacility = carbonIntensityFacility.toFixed(2);
  carbonIntensitySpan.innerText = toFixedCarbonIntensityFacility;

  const percentElec =
    elecIntensity / (parseFloat(elecIntensity) + parseFloat(gasIntensity));
  const percentGas =
    gasIntensity / (parseFloat(elecIntensity) + parseFloat(gasIntensity));

  const toFixedPercentElec = percentElec.toFixed(3);
  const toFixedPercentGas = percentGas.toFixed(3);

  const averageElec = Math.ceil(
    (siteEUI *
      toFixedPercentElec *
      facilitySizeInput.value *
      fixedDecimal *
      ghgGrid) /
      1000
  );

  const averageGas = Math.ceil(
    siteEUI * toFixedPercentGas * facilitySizeInput.value * ghgGas
  );

  const industryAverageGHGEmission = Math.ceil(
    (parseInt(averageElec) + parseInt(averageGas)) / 1000
  );

  const industryAverageCarbonIntensity =
    (industryAverageGHGEmission / facilitySizeInput.value) * 1000;
  const toFixedIndustryAverageCarbonIntensity = industryAverageCarbonIntensity.toFixed(
    2
  );

  const biggerCIF = getBigger(
    toFixedCarbonIntensityFacility,
    toFixedIndustryAverageCarbonIntensity
  );
  const carbonIntensityLastRange = (120 / 100) * biggerCIF;
  const toFixedCarbonIntensityLastRange = carbonIntensityLastRange.toFixed(2);
  carbonIntensityLastRangeSpan.innerText = toFixedCarbonIntensityLastRange;
  averageBarCarbon.innerText = toFixedIndustryAverageCarbonIntensity;

  const carbonIntensityFacilityPercentage =
    (toFixedCarbonIntensityFacility / carbonIntensityLastRange) * 90;
  const averageCarbonIntensityPercentage =
    (industryAverageCarbonIntensity / carbonIntensityLastRange) * 90;

  // carbon intensity people
  const carbonIntensityPerson = ghgEmission / peopleInput.value;
  const toFixedCarbonIntensityPerson = carbonIntensityPerson.toFixed(2);
  carbonIntensityPersonSpan.innerText = toFixedCarbonIntensityPerson;

  const carbonIntensityAveragePerson =
    industryAverageGHGEmission / peopleInput.value;
  const toFixedCarbonIntensityAveragePerson = carbonIntensityAveragePerson.toFixed(
    2
  );
  averageBarCarbonPeople.innerText = toFixedCarbonIntensityAveragePerson;

  const biggerCIPF = getBigger(
    toFixedCarbonIntensityPerson,
    toFixedCarbonIntensityAveragePerson
  );
  const carbonIntensityPeopleLastRange = (120 / 100) * biggerCIPF;
  const toFixedCarbonIntensityPeopleLastRange = carbonIntensityPeopleLastRange.toFixed(
    2
  );
  carbonIntensityPeopleLastRangeSpan.innerText = toFixedCarbonIntensityPeopleLastRange;

  const carbonIntensityPeopleFacilityPercentage =
    (carbonIntensityPerson / carbonIntensityPeopleLastRange) * 90;

  const averageCarbonIntensityPeoplePercentage =
    (carbonIntensityAveragePerson / carbonIntensityPeopleLastRange) * 90;

  // common
  barFacilityName.forEach((name) => {
    name.innerText = facilityNameInput.value;
  });

  caretDown.forEach((caret) => {
    if (caret.classList.contains("eui-facility-caret")) {
      caret.style.left = euiFacilityPercentage + "%";
    } else if (caret.classList.contains("ci-facility-caret")) {
      caret.style.left = carbonIntensityFacilityPercentage + "%";
    } else if (caret.classList.contains("cip-facility-caret")) {
      caret.style.left = carbonIntensityPeopleFacilityPercentage + "%";
    }
  });

  caretUp.forEach((caret) => {
    if (caret.classList.contains("eui-average-caret")) {
      caret.style.left = euiPercentage + "%";
    } else if (caret.classList.contains("ci-average-caret")) {
      caret.style.left = averageCarbonIntensityPercentage + "%";
    } else if (caret.classList.contains("cip-average-caret")) {
      caret.style.left = averageCarbonIntensityPeoplePercentage + "%";
    }
  });
};

// calculation for first pie
const calcPie = () => {
  const electricityCalc =
    ((electricityConsumptionInput.value / 1000) * ghgGrid) / 1000;
  const gasCalc = (gasConsumptionInput.value * ghgGas) / 1000;

  const totalCalc = electricityCalc + gasCalc;

  const electricityPercentage = (electricityCalc / totalCalc) * 100;
  const gasPercentage = (gasCalc / totalCalc) * 100;

  const toFixedElectricityPercentage = electricityPercentage.toFixed(2);
  const toFixedGasPercentage = gasPercentage.toFixed(2);

  pieElecSpan.innerText = toFixedElectricityPercentage + "%";
  pieGasSpan.innerText = toFixedGasPercentage + "%";

  //   pie chart
  var ctx = document.getElementById("myChart").getContext("2d");
  var labels = ["Electricity", "Natural Gas"];
  var colorHex = ["#FF0115", "#444345"];
  var datas = [toFixedElectricityPercentage, toFixedGasPercentage];
  var chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          backgroundColor: colorHex,
          borderColor: colorHex,
          data: datas,
        },
      ],
    },
    options: {
      responsive: true,
    },
  });
};

// calculation second pie
const calcPie1 = () => {
  const fixedValue1 = 277.77777;
  const electricityCalc1 = electricityConsumptionInput.value / fixedValue1;
  const gasCalc1 = gasConsumptionInput.value;

  const totalCalc1 = electricityCalc1 + parseFloat(gasCalc1);

  const electricityPercentage1 = (electricityCalc1 / totalCalc1) * 100;
  const gasPercentage1 = (gasCalc1 / totalCalc1) * 100;

  const toFixedElectricityPercentage1 = electricityPercentage1.toFixed(2);
  const toFixedGasPercentage1 = gasPercentage1.toFixed(2);

  pieElecSpan1.innerText = toFixedElectricityPercentage1 + "%";
  pieGasSpan1.innerText = toFixedGasPercentage1 + "%";

  //   pie chart
  var ctx = document.getElementById("myChart1").getContext("2d");
  var labels = ["Electricity", "Natural Gas"];
  var colorHex = ["#FF0115", "#444345"];
  var datas = [toFixedElectricityPercentage1, toFixedGasPercentage1];
  var chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          backgroundColor: colorHex,
          borderColor: colorHex,
          data: datas,
        },
      ],
    },
    options: {
      responsive: true,
    },
  });
};

#!/usr/bin/env node

'use strict';

const inquirer = require('inquirer');
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));
const axios = require('axios');
const fuzzy = require('fuzzy');
const figlet = require('figlet');
const ora = require('ora');
const _ = require('lodash');
const prompt = inquirer.prompt;
const {
    getCode,
    getName
} = require('country-list');
const chalk = require('chalk');
const [, , ...args] = process.argv;
const yearNow = new Date().getFullYear();
const spinner = ora('Loading.');

spinner.spinner.frames = [
    "[    ]",
    "[=   ]",
    "[==  ]",
    "[=== ]",
    "[ ===]",
    "[  ==]",
    "[   =]",
    "[    ]",
    "[   =]",
    "[  ==]",
    "[ ===]",
    "[====]",
    "[=== ]",
    "[==  ]",
    "[=   ]"
];
spinner.interval = 50;
spinner.color = "yellow";

if (args.length > 0) {
    if (args[0] == "help" || args[0] == "Help" || args[0] == "--help" || args[0] == "--h" || args[0] == "-h") {
        console.log(chalk.yellow("Available commands:\n"));
        console.log(chalk.bold.blue("holidates"), chalk.bold.dim("(Launches the main app with selection and search menus)"));
        console.log(chalk.bold.blue("holidates"), chalk.bold.italic.dim.cyan("country-name"), chalk.bold.dim("(Shows holidays on that country)"));
        console.log(chalk.bold.blue("holidates"), chalk.bold.italic.dim.cyan("country-name"), chalk.bold.italic.dim.green("year"), chalk.dim("(Shows holidays in the specified year on that country)"));
    } else {
        let argsArray = [];
        let checkForYear = [];
        args.forEach((arg) => {
            if (isNaN(arg)) {
                argsArray.push(arg);
            } else {
                checkForYear.push(arg);
            }
        });

        let countryFromParameter = argsArray.join(" ").replace(/(united states of america \(usa\)|usa|united states)|(united kingdom \(uk\)|uk|great britain|gb)/g, function (c1, c2) {
            if (c1) return 'united states of america';
            if (c2) return 'united kingdom';
        });

        let yearFromParameter = checkForYear.join(" ");

        if (yearFromParameter.length <= 0) {
            yearFromParameter = yearNow;
        }
        if (isNaN(yearFromParameter) || yearFromParameter > 9999 || yearFromParameter < 0) {
            console.log(chalk.bold.red("Invalid year, aborting..."));
        }

        console.log("\n");
        spinner.start();

        axios.get("https://date.nager.at/api/v2/publicholidays/" + yearFromParameter + "/" + getCode(countryFromParameter))
            .then((response) => {
                spinner.succeed("Loaded successfully");
                spinner.clear();

                let checkForVowel;
                if (response.status == 200) {
                    console.log("\n");
                    response.data.forEach((dates, index) => {
                        if (/(a)|(e)|(i)|(o)|(u)/.test(dates.name.charAt(0).toLowerCase())) {
                            checkForVowel = "an";
                        } else {
                            checkForVowel = "a";
                        }
                        console.log(chalk.bold.green("(" + index + ") => ") + dates.date + " is " + checkForVowel + " " + dates.name + " (" + dates.localName + ")");
                    });
                    console.log("\n");
                }
            }).catch((err) => {
                spinner.fail("Error");
                spinner.clear();
                console.log(chalk.bold.red("Wether the country can't be found or you've lost connection to the server"));
            });
    }
} else {
    let continents = ["Asia", "Africa", "North America", "South America", "Europe", "Australia"];

    let world = [{
        continent: "Asia",
        countries: ["Afghanistan", "Armenia", "Azerbaijan", "Bahrain", "Bangladesh", "Bhutan", "Brunei", "Cambodia", "China", "Cyprus", "Georgia", "India", "Indonesia", "Iran", "Iraq", "Israel", "Japan", "Jordan", "Kazakhstan", "Kuwait", "Kyrgyzstan", "Laos", "Lebanon", "Malaysia", "Maldives", "Mongolia", "Myanmar (formerly Burma)", "Nepal", "North Korea", "Oman", "Pakistan", "Palestine", "Philippines", "Qatar", "Russia", "Saudi Arabia", "Singapore", "South Korea", "Sri Lanka", "Syria", "Taiwan", "Tajikistan", "Thailand", "Timor-Leste", "Turkey", "Turkmenistan", "United Arab Emirates (UAE)", "Uzbekistan", "Vietnam", "Yemen"]
    }, {
        continent: "Africa",
        countries: ["Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cabo Verde", "Cameroon", "Central African Republic (CAR)", "Chad", "Comoros", "Congo, Democratic Republic of the", "Congo, Republic of the", "Cote d'Ivoire", "Djibouti", "Egypt", "Equatorial Guinea", "Eritrea", "Eswatini (formerly Swaziland)", "Ethiopia", "Gabon", "Gambia", "Ghana", "Guinea", "Guinea-Bissau", "Kenya", "Lesotho", "Liberia", "Libya", "Madagascar", "Malawi", "Mali", "Mauritania", "Mauritius", "Morocco", "Mozambique", "Namibia", "Niger", "Nigeria", "Rwanda", "Sao Tome and Principe", "Senegal", "Seychelles", "Sierra Leone", "Somalia", "South Africa", "South Sudan", "Sudan", "Tanzania", "Togo", "Tunisia", "Uganda", "Zambia", "Zimbabwe"]
    }, {
        continent: "North America",
        countries: ["Antigua and Barbuda", "Bahamas", "Barbados", "Belize", "Canada", "Costa Rica", "Cuba", "Dominica", "Dominican Republic", "El Salvador", "Grenada", "Guatemala", "Haiti", "Honduras", "Jamaica", "Mexico", "Nicaragua", "Panama", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Trinidad and Tobago", "United States of America (USA)"]
    }, {
        continent: "South America",
        countries: ["Argentina", "Bolivia", "Brazil", "Chile", "Colombia", "Ecuador", "Guyana", "Paraguay", "Peru", "Suriname", "Uruguay", "Venezuela"]
    }, {
        continent: "Europe",
        countries: ["Albania", "Andorra", "Armenia", "Austria", "Azerbaijan", "Belarus", "Belgium", "Bosnia and Herzegovina", "Bulgaria", "Croatia", "Cyprus", "Czechia", "Denmark", "Estonia", "Finland", "France", "Georgia", "Germany", "Greece", "Hungary", "Iceland", "Ireland", "Italy", "Kazakhstan", "Kosovo", "Latvia", "Liechtenstein", "Lithuania", "Luxembourg", "Malta", "Moldova", "Monaco", "Montenegro", "Netherlands", "North Macedonia (formerly Macedonia)", "Norway", "Poland", "Portugal", "Romania", "Russia", "San Marino", "Serbia", "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland", "Turkey", "Ukraine", "United Kingdom (UK)", "Vatican City (Holy See)"]
    }, {
        continent: "Australia",
        countries: ["Australia", "Fiji", "Kiribati", "Marshall Islands", "Micronesia", "Nauru", "New Zealand", "Palau", "Papua New Guinea", "Samoa", "Solomon Islands", "Tonga", "Tuvalu", "Vanuatu", ]
    }, ];

    function searchContinent(continentAnswer, input) {
        input = input || '';
        return new Promise(function (resolve) {
            setTimeout(function () {
                var fuzzyResult = fuzzy.filter(input, continents);
                resolve(
                    fuzzyResult.map(function (el) {
                        return el.original;
                    })
                );
            }, _.random(30, 500));
        });
    }


    console.clear();
    console.log(figlet.textSync('holidates', {
        horizontalLayout: 'default',
        verticalLayout: 'default'
    }));

    console.log("Insert country and year to see the holidays 😉 \n");

    function holidates() {
        let continentQuestion = [{
            type: "autocomplete",
            message: "Continent:",
            source: searchContinent,
            name: "continent",
            default: "Europe",
            prefix: "",
        }];

        prompt(continentQuestion).then((continentAnswer) => {

            world.forEach((continent, index) => {
                if (continentAnswer.continent == continent.continent) {

                    function searchCountries(countryAnswer, input) {
                        input = input || '';
                        return new Promise(function (resolve) {
                            setTimeout(function () {
                                var fuzzyResult = fuzzy.filter(input, continent.countries);
                                resolve(
                                    fuzzyResult.map(function (el) {
                                        return el.original;
                                    })
                                );
                            }, _.random(30, 500));
                        });
                    }

                    let countryAndYearQuestion = [{
                        type: "autocomplete",
                        message: "Country:",
                        source: searchCountries,
                        name: "country",
                        prefix: '',
                        default: "Belgium",
                    }, {
                        type: "string",
                        message: "Year:",
                        name: "year",
                        prefix: '',
                        default: yearNow,
                        validate: function (val) {
                            if (val == yearNow) {
                                return true;
                            }
                            if (isNaN(val) || val.trim() == "") {
                                return 'You need to provide a valid year, e.g: ' + yearNow;
                            } else {
                                return true;
                            }
                        },
                    }];

                    prompt(countryAndYearQuestion).then((response) => {
                        console.log("\n");
                        spinner.start();

                        let specialCountry;
                        if (response.country == "United States of America (USA)") {
                            specialCountry = "US";
                        }
                        if (response.country == "United Kingdom (UK)") {
                            specialCountry = "GB";
                        }
                        if (response.country == "United Arab Emirates (UAE)") {
                            specialCountry = "AE";
                        }

                        if (!specialCountry) {
                            specialCountry = getCode(response.country);
                        }

                        axios.get("https://date.nager.at/api/v2/publicholidays/" + response.year + "/" + specialCountry)
                            .then((response) => {

                                spinner.succeed("Loaded successfully");
                                spinner.clear();

                                let checkForVowel;
                                if (response.status == 200) {
                                    console.log("\n");
                                    response.data.forEach((dates, index) => {
                                        if (/(a)|(e)|(i)|(o)|(u)/.test(dates.name.charAt(0).toLowerCase())) {
                                            checkForVowel = "an";
                                        } else {
                                            checkForVowel = "a";
                                        }
                                        console.log(chalk.bold.green("(" + index + ") => ") + dates.date + " is " + checkForVowel + " " + dates.name + " (" + dates.localName + ")");
                                    });
                                    console.log("\n");
                                }

                                prompt([{
                                    type: "confirm",
                                    message: "Relaunch another search?",
                                    source: searchCountries,
                                    name: "relaunch",
                                    prefix: '',
                                    default: true,
                                    choices: ["Y", "n"]
                                }]).then((response) => {
                                    console.log("\n");
                                    if (response.relaunch == true) {
                                        holidates();
                                    }
                                }).catch((err) => {
                                    console.log(chalk.bold.red("Invalid choice, aborting..."));
                                });
                            }).catch((err) => {
                                spinner.fail("Error");
                                spinner.clear();
                                console.log(chalk.bold.red("Wether the country can't be found or you've lost connection to the server"));
                            });
                    }).catch((err) => {
                        console.log(chalk.bold.red("Invalid country or year"));
                    });
                }
            });
        }).catch((err) => {
            console.log(chalk.bold.red("Something went wrong, retry please"));
        });
    }
    holidates();
}
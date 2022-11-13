const { DateTime } = require("luxon");

module.exports = (function (eleventyConfig) {
    eleventyConfig.addFilter("statsdate", (dateObj) => {
        return DateTime.fromJSDate(dateObj).toFormat("yyyy-MM-dd");
    });

    eleventyConfig.addFilter("twoDecimalPoints", (value) => {
        return `${value.toFixed(2)}`;
    });

    eleventyConfig.addFilter("percentage", (value) => {
        let percentageValue = value * 100;

        return `${percentageValue.toFixed(2)}%`;
    });
});
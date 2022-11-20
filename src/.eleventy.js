const { DateTime } = require("luxon");
const charts = require('eleventy-charts');
const { EleventyRenderPlugin } = require("@11ty/eleventy");

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

    eleventyConfig.addFilter("percentageWithoutSign", (value) => {
        let percentageValue = value * 100;

        return `${percentageValue.toFixed(2)}`;
    });

    eleventyConfig.addPlugin(charts);
    eleventyConfig.addPlugin(EleventyRenderPlugin);
});
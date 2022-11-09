const { DateTime } = require("luxon");
const { Client } = require("pg");

module.exports = (function (eleventyConfig) {
    eleventyConfig.addFilter("statsdate", (dateObj) => {
        return DateTime.fromJSDate(dateObj).toFormat("yyyy-MM-dd");
    });

    eleventyConfig.addFilter("percentage", (value) => {
        let percentageValue = value * 100;

        return `${percentageValue.toFixed(2)}%`;
    });

    eleventyConfig.addFilter("fanpoints", (item) => {
        const pointsMultiplier = 3;
        const twoPointfieldGoalAttemptsMultiplier = -0.7;
        const threePointFieldGoalAttemptsMultiplier = -1.2;
        const reboundsMultiplier = 1.5;
        const assistsMultiplier = 2;
        const stealsMultiplier = 3;
        const blocksMultiplier = 3;
        const turnoversMultiplier = -2;

        const fanpoints = (item.TotalPoints * pointsMultiplier)
            + (item["2PA"] * twoPointfieldGoalAttemptsMultiplier)
            + (item["3PA"] * threePointFieldGoalAttemptsMultiplier)
            + (item.TotalRebounds * reboundsMultiplier)
            + (item.Assists * assistsMultiplier)
            + (item.Steals * stealsMultiplier)
            + (item.Blocks * blocksMultiplier)
            + (item.TOV * turnoversMultiplier);

        return `${fanpoints.toFixed(2)}`;
    });
});
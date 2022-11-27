const { Client } = require("pg");
const { DateTime } = require("luxon");

async function getAllStats(client) {

    let allStats = [];

    const totalStatsQueryResult = await client.query(`SELECT COUNT(*) AS "TotalCount" FROM bballstats."allStats"`);

    const totalStatsCount = totalStatsQueryResult.rows[0].TotalCount;

    const limitResultBy = 100;
    const numberOfBatches = Math.floor(totalStatsCount / limitResultBy) + 1;

    const allStatsQueries = [];

    for (let batch = 0; batch <= numberOfBatches; batch++) {
        const offset = batch * limitResultBy;

        allStatsQueries.push(client.query(`SELECT * FROM bballstats."allStats" ORDER BY "Date", "Player", "Game" DESC LIMIT ${limitResultBy} OFFSET ${offset}`));
    }

    const allStatsQueryResults = await Promise.all(allStatsQueries);
    allStatsQueryResults.forEach((batchOfStats) => {
        batchOfStats.rows.forEach((item) => {
            allStats.push(item);
        });
    });

    return allStats;
}


async function getAvailableYears(client) {
    let availableYears = [];
    const availableYearsQuery = client.query(`SELECT DISTINCT "Year" FROM bballstats."playerTotalsPerYear" ORDER BY "Year" DESC`);

    const response = await availableYearsQuery;
    response.rows.forEach((row) => {
        availableYears.push(row.Year);
    });

    return availableYears;
}


async function getAvailableWeeks(client, availableYears) {
    let availableWeeks = {
        allWeeks: []
    };

    const availableWeeksQueries = [];
    availableYears.forEach((year) => {
        availableWeeksQueries.push(client.query(`SELECT DISTINCT "Date" FROM bballstats."allStats" WHERE "Year"=${year} ORDER BY "Date" DESC`));
        availableWeeks[year] = [];
    });

    let availableWeeksQueryResults = await Promise.all(availableWeeksQueries);
    availableWeeksQueryResults.forEach((weeksByYearResult) => {
        const year = weeksByYearResult.rows[0].Date.getFullYear();

        const weeksByYear = weeksByYearResult.rows;

        weeksByYear.forEach((week) => {
            availableWeeks[year].push(DateTime.fromJSDate(week.Date).toFormat("yyyy-MM-dd"));
            availableWeeks.allWeeks.push(DateTime.fromJSDate(week.Date).toFormat("yyyy-MM-dd"));
        });
    });

    return availableWeeks;
}

async function getAvailablePlayers(client) {
    const availablePlayers = []
    const playerCountQuery = client.query(`SELECT COUNT(DISTINCT "Player") AS "NumberOfPlayers" FROM bballstats."allStats"`);

    const playerCountQueryResponse = await playerCountQuery;
    const totalNumberOfPlayers = playerCountQueryResponse.rows[0].NumberOfPlayers;

    const limitResultBy = 100;
    const numberOfBatches = Math.floor(totalNumberOfPlayers / limitResultBy) + 1;

    const playersQueries = [];

    for (let batch = 0; batch < numberOfBatches; batch++) {
        const offset = batch * limitResultBy;
        playersQueries.push(client.query(`SELECT DISTINCT "Player" FROM bballstats."allStats" ORDER BY "Player" LIMIT ${limitResultBy} OFFSET ${offset}`))
    }

    const playersQueryResults = await Promise.all(playersQueries);
    playersQueryResults.forEach((batchOfPlayers) => {
        batchOfPlayers.rows.forEach((item) => {
            availablePlayers.push(item.Player);
        });
    });

    return availablePlayers;
}

async function getYearlyStats(client, availableYears) {

    const yearlyStats = [];

    const yearlyQueries = []

    const yearlyTotalsCountResult = await client.query(`SELECT COUNT(*) AS "TotalCount" FROM bballstats."playerTotalsPerYear"`);
    const yearlyTotalsCount = yearlyTotalsCountResult.rows[0].TotalCount;

    const limitResultBy = 100;
    const numberOfBatches = Math.floor(yearlyTotalsCount / limitResultBy) + 1;

    for (let batch = 0; batch < numberOfBatches; batch++) {
        const offset = batch * limitResultBy;
        yearlyQueries.push(client.query(`SELECT * FROM bballstats."playerTotalsPerYear" ORDER BY "Year" DESC, "FanPoints" DESC LIMIT ${limitResultBy} OFFSET ${offset}`))
    }

    const yearlyQueryResults = await Promise.all(yearlyQueries);

    yearlyQueryResults.forEach((yearResult) => {
        yearlyStats.push(...yearResult.rows);
    });

    return yearlyStats;
}

function calculateYearlyStatsAverage(yearlyStats) {
    let yearlyStatsAverage = [];

    yearlyStats.forEach((item) => {
        const games = item.Games;
        yearlyStatsAverage.push({
            Player: item.Player,
            Year: item.Year,
            Games: item.Games,
            FTM: item.FTM / games,
            FTA: item.FTA / games,
            'FT%': item['FT%'],
            '2PM': item['2PM'] / games,
            '2PA': item['2PA'] / games,
            '2PT%': item['2PT%'],
            '3PM': item['3PM'] / games,
            '3PA': item['3PA'] / games,
            '3PT%': item['3PT%'],
            OReb: item.OReb / games,
            DReb: item.DReb / games,
            Assists: item.Assists / games,
            Steals: item.Steals / games,
            Blocks: item.Blocks / games,
            TOV: item.TOV / games,
            TotalPoints: item.TotalPoints / games,
            FGM: item.FGM / games,
            FGA: item.FGA / games,
            'FG%': item['FG%'],
            TotalRebounds: item.TotalRebounds / games,
            FanPoints: item.FanPoints / games
        })
    });

    return yearlyStatsAverage;
}


function extractWeeklyPlayerTotalStats(weeklyStats, weeklyPlayerTotalStatsQueryResult) {
    weeklyPlayerTotalStatsQueryResult.forEach((result) => {
        let week = DateTime.fromJSDate(result.rows[0].Date).toFormat("yyyy-MM-dd");

        const playerAverages = [];

        weeklyStats[week] = {
            playerTotals: result.rows,
            playerAverages: playerAverages
        };

        weeklyStats[week].playerTotals.sort(function (a, b) {
            return b.FanPoints - a.FanPoints;
        });

        result.rows.forEach((playerTotal) => {
            let games = playerTotal.Games;
            let playerAverage = {
                Date: playerTotal.Date,
                Player: playerTotal.Player,
                Team: playerTotal.Team,
                Games: playerTotal.Games,
                FTM: playerTotal.FTM / games,
                FTA: playerTotal.FTA / games,
                'FT%': playerTotal['FT%'],
                '2PM': playerTotal['2PM'] / games,
                '2PA': playerTotal['2PA'] / games,
                '2PT%': playerTotal['2PT%'],
                '3PM': playerTotal['3PM'] / games,
                '3PA': playerTotal['3PA'] / games,
                '3PT%': playerTotal['3PT%'],
                OReb: playerTotal.OReb / games,
                DReb: playerTotal.DReb / games,
                Assists: playerTotal.Assists / games,
                Steals: playerTotal.Steals / games,
                Blocks: playerTotal.Blocks / games,
                TOV: playerTotal.TOV / games,
                TotalPoints: playerTotal.TotalPoints / games,
                FGM: playerTotal.FGM / games,
                FGA: playerTotal.FGA / games,
                'FG%': playerTotal['FG%'],
                TotalRebounds: playerTotal.TotalRebounds / games,
                FanPoints: playerTotal.FanPoints / games
            }

            playerAverages.push(playerAverage);
        });
    });
}

function extractWeeklyAllGamesStats(weeklyStats, weeklyAllGamesStatsQueryResult) {
    weeklyAllGamesStatsQueryResult.forEach((result) => {
        let week = DateTime.fromJSDate(result.rows[0].Date).toFormat("yyyy-MM-dd");
        let year = DateTime.fromJSDate(result.rows[0].Date).toFormat("yyyy");;

        weeklyStats[week].games = result.rows;
    });
}

function extractWeeklyTeamTotalStats(weeklyStats, weeklyTeamTotalStatsQueryResult) {
    weeklyTeamTotalStatsQueryResult.forEach((result) => {
        let week = DateTime.fromJSDate(result.rows[0].Date).toFormat("yyyy-MM-dd");

        weeklyStats[week].teamSummary = calculateTeamSummary(result.rows);
    });
}

function calculateTeamSummary(teamTotals) {
    let returnResult = {
        team1: {
            altered: false,
            totals: {},
            averages: {}
        },
        team2: {
            altered: false,
            totals: {},
            averages: {}
        },
        team3: {
            altered: false,
            totals: {},
            averages: {}
        },
        team4: {
            altered: false,
            totals: {},
            averages: {}
        },
        team5: {
            altered: false,
            totals: {},
            averages: {}
        },
        team6: {
            altered: false,
            totals: {},
            averages: {}
        }
    };

    teamTotals.forEach((teamTotal) => {
        returnResult[`team${teamTotal.Team}`].totals = teamTotal;
        returnResult[`team${teamTotal.Team}`].altered = true;

        let games = 3;

        let averages = {
            Date: teamTotal.Date,
            Team: teamTotal.Team,
            Game: teamTotal.Games,
            FTM: teamTotal.FTM / games,
            FTA: teamTotal.FTA / games,
            '2PM': teamTotal['2PM'] / games,
            '2PA': teamTotal['2PA'] / games,
            '3PM': teamTotal['3PM'] / games,
            '3PA': teamTotal['3PA'] / games,
            OReb: teamTotal.OReb / games,
            DReb: teamTotal.DReb / games,
            Assists: teamTotal.Assists / games,
            Steals: teamTotal.Steals / games,
            Blocks: teamTotal.Blocks / games,
            TOV: teamTotal.TOV / games,
            TotalPoints: teamTotal.TotalPoints / games,
            FGM: teamTotal.FGM / games,
            FGA: teamTotal.FGA / games,
            TotalRebounds: teamTotal.TotalRebounds / games,
            FanPoints: teamTotal.FanPoints / games
        };

        averages['FT%'] = averages['FTA'] === 0 ? 0 : averages['FTM'] / averages['FTA'],
            averages['2PT%'] = averages['2PA'] === 0 ? 0 : averages['2PM'] / averages['2PA'],
            averages['3PT%'] = averages['3PA'] === 0 ? 0 : averages['3PM'] / averages['3PA'],
            averages['FG%'] = averages['FGA'] === 0 ? 0 : averages['FGM'] / averages['FGA'],

            returnResult[`team${teamTotal.Team}`].averages = averages;
    });

    return returnResult;
}


async function getWeeklyStats(client, availableYears, availableWeeks) {

    const weeklyStats = {};

    const weeklyPlayerTotalStatsQuery = [];
    const weeklyAllGamesStatsQuery = [];
    const weeklyTeamTotalStatsQuery = [];

    availableWeeks.allWeeks.forEach((week) => {
        weeklyStats[week] = {
            date: week
        };
        // For each week get the totals for each player per week
        // Get all the games for each week
        // Get the team total stats for each week.

        weeklyPlayerTotalStatsQuery.push(client.query(`SELECT * FROM bballstats."playerTotalsPerWeek" WHERE "Date" = '${week}' ORDER BY "Player"`));
        weeklyAllGamesStatsQuery.push(client.query(`SELECT * FROM bballstats."allStats" WHERE "Date" = '${week}' ORDER BY "Game", "Team", "Player"`));
        weeklyTeamTotalStatsQuery.push(client.query(`SELECT * FROM bballstats."teamTotalsPerWeek" WHERE "Date" = '${week}' ORDER BY "Team"`));
    });

    let weeklyPlayerTotalStatsQueryResults = await Promise.all(weeklyPlayerTotalStatsQuery);
    extractWeeklyPlayerTotalStats(weeklyStats, weeklyPlayerTotalStatsQueryResults);

    let weeklyAllGamesStatsQueryResult = await Promise.all(weeklyAllGamesStatsQuery);
    extractWeeklyAllGamesStats(weeklyStats, weeklyAllGamesStatsQueryResult);

    let weeklyTeamTotalStatsQueryResult = await Promise.all(weeklyTeamTotalStatsQuery);
    extractWeeklyTeamTotalStats(weeklyStats, weeklyTeamTotalStatsQueryResult);

    return weeklyStats;
}

// Example game:
// {
//     Date: 2020-02-17T00:00:00.000Z,
//     Year: '2020',
//     Player: 'Ben',
//     Team: '2',
//     Opponent: '1',
//     Game: '60',
//     FTM: '0',
//     FTA: '0',
//     'FT%': '0',
//     '2PM': '0',
//     '2PA': '1',
//     '2PT%': '0',
//     '3PM': '0',
//     '3PA': '3',
//     '3PT%': '0',
//     OReb: '0',
//     DReb: '0',
//     Assists: '0',
//     Steals: '0',
//     Blocks: '0',
//     TOV: '1',
//     'Win/Loss': 'L',
//     Win: 0,
//     Loss: 1,
//     Draw: 0,
//     FGM: '0',
//     FGA: '4',
//     'FG%': '0',
//     TotalPoints: '0',
//     TotalRebounds: '0',
//     FanPoints: '-6.3'
// }

function getPlayersStats(availablePlayers, allStats) {

    let players = {};

    allStats.forEach((game) => {
        if (!players.hasOwnProperty(game.Player)) {
            players[game.Player] = {
                games: [],
                totalpointsChartData: ""
            }
        }

        players[game.Player].games.push(game);

        // TODO: Might have to fix this.

        let str = players[game.Player].totalpointsChartData;
        if (str.length > 0) {
            str = `${str}\n`;
        }
        players[game.Player].totalpointsChartData = `${str}${DateTime.fromJSDate(game.Date).toFormat("yyyy-MM-dd")},${game.TotalPoints}`
    });

    let returnPlayerResult = [];

    availablePlayers.forEach((player) => {
        if (!players[player]) {
            console.warn(`No player data for ${player}`);
            return;
        }

        const playerGames = players[player].games;

        playerGames.sort(function (a, b) {
            return new Date(b.Date) - new Date(a.Date);
        });

        returnPlayerResult.push({ name: player, stats: playerGames, totalpointsChartData: players[player].totalpointsChartData });
    });

    return returnPlayerResult;
}

function getTopStat(statType, yearlyStats, year, topNumberOfStats) {
    const filteredSetOfStatsByYear = yearlyStats.filter((item) => item.Year == year);

    filteredSetOfStatsByYear.sort(function (a, b) {
        return b[statType] - a[statType];
    });

    return filteredSetOfStatsByYear.slice(0, topNumberOfStats);
}

function calculateLeaderBoardStats(availableYears, yearlyStats) {
    let leaderBoardStats = {}

    const topX = 10;

    availableYears.forEach((year) => {
        leaderBoardStats[year] = {
            totals: {
                TotalPoints: getTopStat("TotalPoints", yearlyStats, year, topX),
                "FG%": getTopStat("FG%", yearlyStats, year, topX),
                TotalRebounds: getTopStat("TotalRebounds", yearlyStats, year, topX),
                OReb: getTopStat("OReb", yearlyStats, year, topX),
                DReb: getTopStat("DReb", yearlyStats, year, topX),
                Assists: getTopStat("Assists", yearlyStats, year, topX),
                Blocks: getTopStat("Blocks", yearlyStats, year, topX),
                Steals: getTopStat("Steals", yearlyStats, year, topX),
                FanPoints: getTopStat("FanPoints", yearlyStats, year, topX),
            }
        }
    });

    // Calculate best averages - all, 10, 30, 50 game minimums

    // Calculate best week totals

    // Calculate best games totals
    return leaderBoardStats;
}

module.exports = async function () {
    const client = new Client({
        host: "host.docker.internal",
        port: 5432,
        user: "postgres",
        password: "postgres",
        database: "bballstats"
    });

    try {
        client.connect();
    } catch (e) {
        console.error(e);
        throw e;
    }


    let allStats = await getAllStats(client);
    let availableYears = await getAvailableYears(client);
    let availableWeeks = await getAvailableWeeks(client, availableYears);
    let availablePlayers = await getAvailablePlayers(client);
    let yearlyStats = await getYearlyStats(client, availableYears);
    let yearlyStatsAverage = calculateYearlyStatsAverage(yearlyStats);
    let weeklyStats = await getWeeklyStats(client, availableYears, availableWeeks);
    let playersStats = getPlayersStats(availablePlayers, allStats);
    let leaderBoardStats = calculateLeaderBoardStats(availableYears, yearlyStats);

    return {
        allStats: allStats,
        availableYears: availableYears,
        availableWeeks: availableWeeks,
        players: availablePlayers,
        yearlyStats: yearlyStats,
        yearlyStatsAverage: yearlyStatsAverage,
        weeklyStats: weeklyStats,
        playersStats: playersStats,
        leaderBoardStats: leaderBoardStats,
    };
}
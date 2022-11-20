const { Client } = require("pg");
const { DateTime } = require("luxon");

async function getAllStats() {
    const client = new Client({
        host: "host.docker.internal",
        port: 5432,
        user: "postgres",
        password: "postgres",
        database: "bballstats"
    });

    let allStats = [];
    try {
        client.connect();
        const playerTotalsPerGameQuery = client.query("SELECT * FROM bballstats.\"allStats\" LIMIT 10");

        const response = await playerTotalsPerGameQuery;
        allStats = response.rows;

    } catch (e) {
        console.error(e);
    }

    return allStats;
}

async function getAllTimeStats() {
    const client = new Client({
        host: "host.docker.internal",
        port: 5432,
        user: "postgres",
        password: "postgres",
        database: "bballstats"
    });

    let allTimeStats = [];
    try {
        client.connect();
        const allTimeStatsQuery = client.query("SELECT * FROM bballstats.\"playerAllTimeTotals\" ORDER BY \"Player\"");

        const response = await allTimeStatsQuery;
        allTimeStats = response.rows;

    } catch (e) {
        console.error(e);
    }

    return allTimeStats;
}

async function getYearlyStats() {
    const client = new Client({
        host: "host.docker.internal",
        port: 5432,
        user: "postgres",
        password: "postgres",
        database: "bballstats"
    });

    let yearlyStats = [];
    try {
        client.connect();
        const yearlyStatsQuery = client.query("SELECT * FROM bballstats.\"playerTotalsPerYear\" ORDER BY \"Player\"");

        const response = await yearlyStatsQuery;
        yearlyStats = response.rows;

    } catch (e) {
        console.error(e);
    }

    return yearlyStats;
}

async function getAvailableWeeks() {
    const client = new Client({
        host: "host.docker.internal",
        port: 5432,
        user: "postgres",
        password: "postgres",
        database: "bballstats"
    });

    let availableWeeks = [];
    try {
        client.connect();
        const availableWeeksQuery = client.query("SELECT DISTINCT \"Date\" FROM bballstats.\"allStats\" ORDER BY \"Date\" DESC");

        const response = await availableWeeksQuery;
        response.rows.forEach((row) => {
            let isoDateValue = DateTime.fromJSDate(row.Date).toFormat("yyyy-MM-dd")
            availableWeeks.push(isoDateValue);
        })
    } catch (e) {
        console.error(e);
    }

    return availableWeeks;
}

async function getWeeklyStats() {
    const client = new Client({
        host: "host.docker.internal",
        port: 5432,
        user: "postgres",
        password: "postgres",
        database: "bballstats"
    });

    let weeklyStatsMap = new Map();
    let weeklyStats = [];
    try {
        client.connect();

        // Get all the weeks available.

        const availableWeeksQuery = client.query("SELECT DISTINCT \"Date\" FROM bballstats.\"allStats\" ORDER BY \"Date\" DESC");

        const response = await availableWeeksQuery;
        let availableWeeks = response.rows;

        let weeklyPlayerTotalStatsQuery = [];
        let weeklyAllGamesStatsQuery = [];
        let weeklyTeamTotalStatsQuery = [];

        // For each week get the totals for each player per week
        // Get all the games for each week

        availableWeeks.forEach(async (week) => {
            let dateValue = DateTime.fromJSDate(week.Date).toFormat("yyyy-MM-dd");
            weeklyPlayerTotalStatsQuery.push(client.query(`SELECT * FROM bballstats."playerTotalsPerWeek" WHERE "Date" = '${dateValue}' ORDER BY "Player"`));
            weeklyAllGamesStatsQuery.push(client.query(`SELECT * FROM bballstats."allStats" WHERE "Date" = '${dateValue}' ORDER BY "Game", "Team", "Player"`));
            weeklyTeamTotalStatsQuery.push(client.query(`SELECT * FROM bballstats."teamTotalsPerWeek" WHERE "Date" = '${dateValue}' ORDER BY "Team"`));
        });

        let weeklyPlayerTotalStatsQueryResult = await Promise.all(weeklyPlayerTotalStatsQuery);

        weeklyPlayerTotalStatsQueryResult.forEach((result) => {
            let dateKey = DateTime.fromJSDate(result.rows[0].Date).toFormat("yyyy-MM-dd");

            let weeklyStatData = weeklyStatsMap.get(dateKey);

            if (!weeklyStatData) {
                weeklyStatData = { date: dateKey };
            }
            weeklyStatData.playerTotals = result.rows;

            weeklyStatData.playerAverages = [];

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

                weeklyStatData.playerAverages.push(playerAverage);
            })

            weeklyStatsMap.set(dateKey, weeklyStatData);
        });

        let weeklyAllGamesStatsQueryResult = await Promise.all(weeklyAllGamesStatsQuery);
        weeklyAllGamesStatsQueryResult.forEach((result) => {
            let dateKey = DateTime.fromJSDate(result.rows[0].Date).toFormat("yyyy-MM-dd");

            let weeklyStatData = weeklyStatsMap.get(dateKey);

            if (!weeklyStatData) {
                weeklyStatData = { date: dateKey };
            }
            weeklyStatData.games = result.rows;

            weeklyStatsMap.set(dateKey, weeklyStatData);
        });

        let weeklyTeamTotalStatsQueryResult = await Promise.all(weeklyTeamTotalStatsQuery);
        weeklyTeamTotalStatsQueryResult.forEach((result) => {
            let dateKey = DateTime.fromJSDate(result.rows[0].Date).toFormat("yyyy-MM-dd");

            let weeklyStatData = weeklyStatsMap.get(dateKey);

            if (!weeklyStatData) {
                weeklyStatData = { date: dateKey };
            }

            weeklyStatData.teamSummary = calculateTeamSummary(result.rows);

            weeklyStatsMap.set(dateKey, weeklyStatData);
        })

        weeklyStatsMap.forEach((value, key) => {
            weeklyStats.push(value);
        });

    } catch (e) {
        console.error(e);
    }

    return weeklyStats;
}

function calculateTeamSummary(teamTotals) {
    let returnResult = {
        team1: {
            totals: {},
            averages: {}
        },
        team2: {
            totals: {},
            averages: {}
        },
        team3: {
            totals: {},
            averages: {}
        },
        team4: {
            totals: {},
            averages: {}
        }
    };

    teamTotals.forEach((teamTotal) => {
        returnResult[`team${teamTotal.Team}`].totals = teamTotal;

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

async function getPlayers() {
    const client = new Client({
        host: "host.docker.internal",
        port: 5432,
        user: "postgres",
        password: "postgres",
        database: "bballstats"
    });

    let players = [];
    try {
        client.connect();
        const playersQuery = client.query("SELECT DISTINCT \"Player\" FROM bballstats.\"allStats\" ORDER BY \"Player\"");

        const response = await playersQuery;
        response.rows.forEach((item) => {
            players.push(item.Player);
        });

    } catch (e) {
        console.error(e);
    }

    return players;
}

async function getPlayersStats() {
    const client = new Client({
        host: "host.docker.internal",
        port: 5432,
        user: "postgres",
        password: "postgres",
        database: "bballstats"
    });

    let players = [];
    let playerNames = [];
    let playerStatsQueryResult = [];
    try {
        client.connect();
        const playersQuery = client.query("SELECT DISTINCT \"Player\" FROM bballstats.\"allStats\" ORDER BY \"Player\"");

        const response = await playersQuery;
        response.rows.forEach((item) => {
            playerNames.push(item.Player);
        });

        let playerStatsQuery = [];

        playerNames.forEach(async (player) => {
            playerStatsQuery.push(client.query(`SELECT * FROM bballstats."allStats" WHERE "Player" = '${player}' ORDER BY "Player"`));
        });

        playerStatsQueryResult = await Promise.all(playerStatsQuery);

        playerStatsQueryResult.forEach((result) => {
            let str = "";
            result.rows.forEach((item) => {
                str = `${str}\n${DateTime.fromJSDate(item.Date).toFormat("yyyy-MM-dd")},${item.TotalPoints}`;
            });
            players.push({ name: result.rows[0].Player, stats: result.rows, totalpointsChartData: str });
        });
    } catch (e) {
        console.error(e);
    }

    return players;
}

function calculateYearlyStatsAverage(yearlyStats) {
    let yearlyStatsAverage = [];

    yearlyStats.forEach((item) => {
        const games = item.Games;
        yearlyStatsAverage.push({
            Player: item.Player,
            Games: item.Games,
            FTM: item.FTM / games,
            FTA: item.FTA / games,
            'FT%': item['FT%'] / games,
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

function getTopStat(statType, allStats, topNumberOfStats) {
    let collatedStat = new Map();

    // Go through every yearly stat. So stats are in totals already

    allStats.forEach((statItem) => {
        // If the collatedStat already has that stat value.
        if (collatedStat.has(statItem[statType])) {
            // Get the stat value
            let playerMap = collatedStat.get(statItem[statType]);

            // Check if the stat value already has that player
            if (playerMap.has(statItem.Player)) {
                // If so get the player and increment that player's count
                let playerCount = playerMap.get(statItem.Player);
                playerCount++;

                playerMap.set(statItem.Player, playerCount);
            } else {
                // Else add that player with an initial count of 1
                playerMap.set(statItem.Player, 1);
            }
        } else {
            // If the stat is not in the collated value create a new stat value
            let playerMap = new Map();
            playerMap.set(statItem.Player, 1);
            collatedStat.set(parseInt(statItem[statType]), playerMap);
        }
    });

    let keys = [...collatedStat.keys()];
    keys.sort(function (a, b) { return b - a });

    let topStats = []

    for (let index = 0; index < topNumberOfStats && index < keys.length; index++) {
        let players = collatedStat.get(keys[index]);
        let playerDetails = [];

        players.forEach(function(value, key) {
            playerDetails.push({name: key, count: value});
        })

        topStats.push({ statValue: keys[index], players: playerDetails });
    }

    return topStats;
}

function calculateLeaderBoardStats(allStats) {
    let leaderBoardStats = {
        totals: {
            TotalPoints: getTopStat("TotalPoints", allStats, 10),
            TotalRebounds: getTopStat("TotalRebounds", allStats, 10),
            OReb: getTopStat("OReb", allStats, 10),
            DReb: getTopStat("DReb", allStats, 10),
            Assists: getTopStat("Assists", allStats, 10),
            Blocks: getTopStat("Blocks", allStats, 10),
            Steals: getTopStat("Steals", allStats, 10),
            FanPoints: getTopStat("FanPoints", allStats, 10),
        }
    }

    // Calculate best averages - all, 10, 30, 50 game minimums

    // Calculate best week totals

    // Calculate best games totals
    return leaderBoardStats;
}

module.exports = async function () {
    // let allTimeStats = await getAllTimeStats();

    // let allStats = await getAllStats();

    let yearlyStats = await getYearlyStats();

    let leaderBoardStats = calculateLeaderBoardStats(yearlyStats);

    let availableWeeks = await getAvailableWeeks();
    let weeklyStats = await getWeeklyStats();
    let players = await getPlayers();
    let playersStats = await getPlayersStats();

    let yearlyStatsAverage = calculateYearlyStatsAverage(yearlyStats);

    return {
        // allTimeStats: allTimeStats,
        yearlyStats: yearlyStats,
        leaderBoardStats: leaderBoardStats,
        yearlyStatsAverage: yearlyStatsAverage,
        availableWeeks: availableWeeks,
        weeklyStats: weeklyStats,
        players: players,
        playersStats: playersStats
    };
}
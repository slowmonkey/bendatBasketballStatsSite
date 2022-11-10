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
        const availableWeeksQuery = client.query("SELECT DISTINCT \"Date\" FROM bballstats.\"allStats\" ORDER BY \"Date\" DESC");

        const response = await availableWeeksQuery;
        let availableWeeks = response.rows;

        let weeklyPlayerTotalStatsQuery = [];
        let weeklyAllGamesStatsQuery = [];

        availableWeeks.forEach(async (week) => {
            let dateValue = DateTime.fromJSDate(week.Date).toFormat("yyyy-MM-dd");
            weeklyPlayerTotalStatsQuery.push(client.query(`SELECT * FROM bballstats."playerTotalsPerWeek" WHERE "Date" = '${dateValue}' ORDER BY "Player"`));
            weeklyAllGamesStatsQuery.push(client.query(`SELECT * FROM bballstats."allStats" WHERE "Date" = '${dateValue}' ORDER BY "Game", "Team", "Player"`));
        });

        let weeklyPlayerTotalStatsQueryResult = await Promise.all(weeklyPlayerTotalStatsQuery);

        weeklyPlayerTotalStatsQueryResult.forEach((result) => {
            let dateKey = DateTime.fromJSDate(result.rows[0].Date).toFormat("yyyy-MM-dd");

            let weeklyStatData = weeklyStatsMap.get(dateKey);

            if (weeklyStatData) {
                weeklyStatData.playerTotals = result.rows;
            } else {
                weeklyStatData = { date: dateKey, playerTotals: result.rows };
            }
            weeklyStatsMap.set(dateKey, weeklyStatData);
        });

        let weeklyAllGamesStatsQueryResult = await Promise.all(weeklyAllGamesStatsQuery);
        weeklyAllGamesStatsQueryResult.forEach((result) => {
            let dateKey = DateTime.fromJSDate(result.rows[0].Date).toFormat("yyyy-MM-dd");

            let weeklyStatData = weeklyStatsMap.get(dateKey);

            if (weeklyStatData) {
                weeklyStatData.games = result.rows;
            } else {
                weeklyStatData = { date: dateKey, games: result.rows };
            }
            weeklyStatsMap.set(dateKey, weeklyStatData);
        });

        weeklyStatsMap.forEach((value, key) => {            
            weeklyStats.push(value);
        });

    } catch (e) {
        console.error(e);
    }

    return weeklyStats;
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
            players.push({ name: result.rows[0].Player, stats: result.rows });
        });
    } catch (e) {
        console.error(e);
    }

    return players;
}

module.exports = async function () {
    let allStats = await getAllStats();
    let yearlyStats = await getYearlyStats();
    let availableWeeks = await getAvailableWeeks();
    let weeklyStats = await getWeeklyStats();
    let players = await getPlayers();
    let playersStats = await getPlayersStats();

    return {
        allStats: allStats,
        yearlyStats: yearlyStats,
        availableWeeks: availableWeeks,
        weeklyStats: weeklyStats,
        players: players,
        playersStats: playersStats
    };
}
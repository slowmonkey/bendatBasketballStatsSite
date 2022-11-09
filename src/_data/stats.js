const { Client } = require("pg");

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
        availableWeeks = response.rows;

        // console.log({ availableWeeks: availableWeeks });

    } catch (e) {
        console.error(e);
    }

    return availableWeeks;
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

    console.log(`Players Count: ${players.length}`);

    return players;
}

module.exports = async function () {
    let allStats = await getAllStats();
    let yearlyStats = await getYearlyStats();
    let availableWeeks = await getAvailableWeeks();
    let players = await getPlayers();
    let playersStats = await getPlayersStats();

    console.log({ playersStats: playersStats });

    return {
        allStats: allStats,
        yearlyStats: yearlyStats,
        availableWeeks: availableWeeks,
        players: players,
        playersStats: playersStats
    };
}
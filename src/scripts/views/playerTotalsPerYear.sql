DROP VIEW bballstats."playerTotalsPerYear";
CREATE OR REPLACE VIEW bballstats."playerTotalsPerYear" AS
    WITH groupedData AS (
    SELECT
        "Player",
        COUNT("Player") AS "Games",
        SUM("FTM") AS "FTM",
        SUM("FTA") AS "FTA",
        CASE
            WHEN SUM("FTA") > 0 THEN SUM("FTM")/SUM("FTA")
            ELSE 0
        END AS "FT%",
        SUM("2PM") AS "2PM",
        SUM("2PA") AS "2PA",
        CASE
            WHEN SUM("2PA") > 0 THEN SUM("2PM")/SUM("2PA")
            ELSE 0
        END AS "2PT%",
        SUM("3PM") AS "3PM",
        SUM("3PA") AS "3PA",
        CASE
            WHEN SUM("3PA") > 0 THEN SUM("3PM")/SUM("3PA")
            ELSE 0
        END AS "3PT%",
        SUM("OReb") AS "OReb",
        SUM("DReb") AS "DReb",
        SUM("Assists") AS "Assists",
        SUM("Steals") AS "Steals",
        SUM("Blocks") AS "Blocks",
        SUM("TOV") AS "TOV",
        SUM("TotalPoints") AS "TotalPoints",
        SUM("FGM") AS "FGM",
        SUM("FGA") AS "FGA",
        SUM("TotalRebounds") AS "TotalRebounds",
        SUM("Win") AS "Wins",
        SUM("Loss") AS "Losses",
        SUM("Win")/COUNT("Player") AS "Win%",
        SUM("Loss")/COUNT("Player") AS "Loss%",
        SUM("Draw")/COUNT("Player") AS "Draw%"
    FROM bballstats."allStats"
    GROUP BY "Player"
    )
    SELECT
        "Player",
        "Games",
        "FTM",
        "FTA",
        "FT%",
        "2PM",
        "2PA",
        "2PT%",
        "3PM",
        "3PA",
        "3PT%",
        "OReb",
        "DReb",
        "Assists",
        "Steals",
        "Blocks",
        "TOV",
        "TotalPoints",
        "FGM",
        "FGA",
        CASE
            WHEN "FGA" > 0 THEN "FGM"/"FGA"
            ELSE 0
        END AS "FG%",
        "TotalRebounds",
        "Wins",
        "Losses",
        "Win%",
        "Loss%",
        "Draw%"
    FROM groupedData

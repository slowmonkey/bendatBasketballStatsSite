DROP VIEW bballstats."allStats";
CREATE OR REPLACE VIEW bballstats."allStats" AS
    SELECT 
        "Date", 
        CASE WHEN an."Alias" IS NOT NULL THEN an."Alias"
        ELSE ptpg."Player" 
        END AS "Player",
        "Team", 
        "Opponent", 
        "Game", 
        "FTM", 
        "FTA", 
        CASE
            WHEN "FTA" > 0 THEN "FTM"/"FTA"
            ELSE 0
        END AS "FT%",
        "2PM", 
        "2PA",
        CASE
            WHEN "2PA" > 0 THEN "2PM"/"2PA"
            ELSE 0
        END AS "2PT%",
        "3PM", 
        "3PA", 
        CASE
            WHEN "3PA" > 0 THEN "3PM"/"3PA"
            ELSE 0
        END AS "3PT%",
        "OReb", 
        "DReb", 
        "Assists", 
        "Steals", 
        "Blocks", 
        "TOV" AS "TOV", 
        "Win/Loss",
        CASE "Win/Loss"
            WHEN 'W' THEN 1
            ELSE 0
        END AS "Win",
        CASE "Win/Loss"
            WHEN 'L' THEN 1
            ELSE 0
        END AS "Loss",
        CASE "Win/Loss"
            WHEN 'D' THEN 1
            ELSE 0
        END AS "Draw",
        ("2PM"+"3PM") AS "FGM",
        ("2PA"+"3PA") AS "FGA",
        CASE
            WHEN ("2PA"+"3PA") > 0 THEN ("2PM"+"3PM")/("2PA"+"3PA")
            ELSE 0
        END AS "FG%",
        ("2PM"*2)+("3PM"*3)+"FTM" AS "TotalPoints",
        "OReb"+"DReb" AS "TotalRebounds"
	FROM bballstats."playerTotalsPerGame" ptpg
    LEFT JOIN bballstats."aliasNames" an ON an."Player" = ptpg."Player";
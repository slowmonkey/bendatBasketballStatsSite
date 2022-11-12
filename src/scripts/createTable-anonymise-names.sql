DROP TABLE bballstats."aliasNames";

CREATE TABLE IF NOT EXISTS bballstats."aliasNames" (
    "Id" SERIAL PRIMARY KEY,
    "Player" VARCHAR(50) NOT NULL,
    "Alias" VARCHAR(50) NOT NULL
);

INSERT INTO bballstats."aliasNames" ("Player", "Alias") values ('Brendan Lim', 'B. Tay');
INSERT INTO bballstats."aliasNames" ("Player", "Alias") values ('Chee Kao', 'Chee');
INSERT INTO bballstats."aliasNames" ("Player", "Alias") values ('Dave Laan', 'D. Laan');
INSERT INTO bballstats."aliasNames" ("Player", "Alias") values ('Dave Le', 'D. Le');
INSERT INTO bballstats."aliasNames" ("Player", "Alias") values ('Dave Shoebridge', 'D. Shoeba');

COMMIT;
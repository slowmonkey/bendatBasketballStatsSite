---
layout: base-player-charts.njk
pagination:
    data: stats.playersStats
    size: 1
    alias: player
permalink: "player-charts/{{ player.name | slugify }}/"
---
# Per Game Charts
## Total Points
```bar-chart
---
width: 800
height: 500
---
Date,Value
{% for item in player.stats %}{{ item.Date | statsdate }}-{{ item.Game }},{{ item.TotalPoints }}
{% endfor %}```

## FG%
```bar-chart
---
width: 800
height: 500
---
Date,Value
{% for item in player.stats %}{{ item.Date | statsdate }}-{{ item.Game }},{{ item["FG%"] | percentageWithoutSign }}
{% endfor %}```

## Rebounds
```bar-chart
---
width: 800
height: 500
---
Date,Value
{% for item in player.stats %}{{ item.Date | statsdate }}-{{ item.Game }},{{ item.TotalRebounds }}
{% endfor %}```

## Assists
```bar-chart
---
width: 800
height: 500
---
Date,Value
{% for item in player.stats %}{{ item.Date | statsdate }}-{{ item.Game }},{{ item.Assists }}
{% endfor %}```

## Steals
```bar-chart
---
width: 800
height: 500
---
Date,Value
{% for item in player.stats %}{{ item.Date | statsdate }}-{{ item.Game }},{{ item.Steals }}
{% endfor %}```

## Blocks
```bar-chart
---
width: 800
height: 500
---
Date,Value
{% for item in player.stats %}{{ item.Date | statsdate }}-{{ item.Game }},{{ item.Blocks }}
{% endfor %}```

## Turnovers
```bar-chart
---
width: 800
height: 500
---
Date,Value
{% for item in player.stats %}{{ item.Date | statsdate }}-{{ item.Game }},{{ item.TOV }}
{% endfor %}```
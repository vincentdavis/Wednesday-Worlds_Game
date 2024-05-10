## Wednesday Worlds Game
_A cycling game in the sprit of all those weeknight training ride aroud the world_


### Referances
- [ClimbByWatts](https://docs.google.com/spreadsheets/d/1g2T-w1-KbahaAk7T52RCF9KYeuOKjziuY3DXG_pIILY/edit#gid=1161689816)
- [power_v_speed](https://www.gribble.org/cycling/power_v_speed.html)

### Basic Dynamics and settings:
Set at the begining of the game:

#### Rider profile:
- Weight: 40kg <= W <= 200kg
- Max power: 1-2000 watts
- 20min power = 1-1000 watts must be <= 75% Max power
- Total energy = weight * 1000

#### Dynamics settings:
- Altitude [m]:	0 m
- Temperature [°C]:	20.0 °C
- Drag Coefficent [Cd]:	0.800
- Drivetrain Losses [%]:	4 %
- Coefficient of rolling resistance	0.005
- Draft Coefficient: 1
- Wind direction [deg]: 180
- Wind Speed [m/s]: 0

#### Dynamics equations:
- Draft calculation:
Steps:
1. Select all rider who are ahead, distance to finish is less then current rider and withing 3 meters. The draft is effected by distance behind and beside (not directly behind.
2. Draft effect = (Draft effect)/(1+distance) * ((Draft effect)/(1+ diff in X location) Will need to play with this.
3. TODO: Need to write the correct formula for speed given power






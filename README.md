# Turtle Racing Simulation Game

## Project Introduction

Test your skills in this simulated turtle racing game!  Choose between 5 different racers and 6 tracks to get started. A pre-built API by a team at Udacity will create the race selected by the player and return a stream of information lasting the duration of the race, resulting in a final ranking of turtles. This project utilizes Promises and Async/Await to create races, display realtime race updates, and show a final score/rankings view.

### Player Instructions

The strategy of the game is for a player to choose a turtle they expect to win on a certain race track based on the turtle's characteristics (acceleration, handling, and top speed). The game begins and the player accelerates their racer by clicking an acceleration button. As they accelerate, so do the other players and the leaderboard live-updates as players change position on the track. Once all turtles have crossed the finish line, a final view will show the players' rankings.

### Getting Started

1. After cloning the repository, install dependencies for this project by running `npm install`.

2. The game engine has been compiled down to a binary so that you can run it on any system. To run the server, locate your operating system and run the associated command in your terminal at the root of the project.

    | Your OS               | Command to start the API                                  |
    | --------------------- | --------------------------------------------------------- |
    | Mac                   | `ORIGIN_ALLOWED=http://localhost:3000 ./bin/server-osx`   |
    | Windows               | `ORIGIN_ALLOWED=http://localhost:3000 ./bin/server.exe`   |
    | Linux (Ubuntu, etc..) | `ORIGIN_ALLOWED=http://localhost:3000 ./bin/server-linux` |

    If you are on an older OS and the above command doesn't run for you - or if you know that you are running a 32bit system - add `-32` to the end of the file name. For reference, here are the same commands but for a 32-bit system.

    | 32 Bit Systems Only!  | Command to start the API                                     |
    | --------------------- | ------------------------------------------------------------ |
    | Mac                   | `ORIGIN_ALLOWED=http://localhost:3000 ./bin/server-osx-32`   |
    | Windows               | `ORIGIN_ALLOWED=http://localhost:3000 ./bin/server-32.exe`   |
    | Linux (Ubuntu, etc..) | `ORIGIN_ALLOWED=http://localhost:3000 ./bin/server-linux-32` |

3. Start the frontend by running `npm start` at the root of this project. You should then be able to access <http://localhost:3000>.

### Languages and Tools Used

* JavaScript
* Node.js
* Express
* Promise
* Async/Await

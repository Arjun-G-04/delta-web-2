// VARIABLES

// Get the canva and context element
const canvas = document.getElementById("myCanvas") ;
const c = canvas.getContext('2d') ;

// Set canva full screen
canvas.width = window.innerWidth ;
canvas.height = window.innerHeight ;
document.body.style.overflow = 'hidden';

let pressedKey = {a:false, d:false, w:false, s:false} ;
let mouseX = 0 ;
let mouseY = 0 ;
let health = 100 ;
let maxHealth = 100 ;
let score = 0 ;
let highScoreVal = 0 ;
let paused = true ;
let playPause = document.getElementById('playPause') ;

// Player object
class Player {
    constructor() {
        this.position = {x:200, y:canvas.height - 100} ;
        this.velocity = {x:0, y:0} ;
        this.radius = 20 ;
        this.angle = radian(270) ;
    }

    draw() {
        // set position
        this.position.x += this.velocity.x ;
        this.position.y += this.velocity.y ;

        // gun part
        let angle = Math.atan((mouseY - this.position.y) / (mouseX - this.position.x)) ;
        if (mouseX < this.position.x) {
            angle += Math.PI ;
        }
        c.save() ;
        c.translate(this.position.x, this.position.y) ;
        c.rotate(angle) ;
        c.fillStyle = 'grey' ;
        c.fillRect(0, -5, 40, 10) ;
        c.restore() ;

        // circle part
        c.beginPath() ;
        c.fillStyle = 'red' ;
        c.arc(this.position.x, this.position.y, this.radius, 0, 2*Math.PI) ;
        c.fill() ;     
    }
}

class Bullet {
    constructor(position, velocity) {
        this.position = position ;
        this.velocity = velocity ;
    }

    draw() {
        // set position
        this.position.x += this.velocity.x ;
        this.position.y += this.velocity.y ;

        c.beginPath() ;
        c.fillStyle = 'pink' ;
        c.arc(this.position.x, this.position.y, 5, 0, 2*Math.PI) ;
        c.fill() ;  
    }
}

class Bot {
    constructor(position, velocity) {
        this.position = position ;
        this.velocity = velocity ;
        this.originalVelocity = velocity ;

        let image = new Image() ;
        image.src = 'assets/bot.png' ;
        image.onload = () => {
            this.image = image ;
            this.width = 35 ;
            this.height = 35 ;
        } ;
    }

    draw() {
        this.position.x += this.velocity.x ;
        this.position.y += this.velocity.y ;

        if (this.image) {
            c.drawImage(
                this.image,
                this.position.x,
                this.position.y,
                this.width,
                this.height
            )
        }
    }
}

class Cluster {
    constructor(position, velocity) {
        this.position = position ;
        this.velocity = velocity ;
        this.bots = [] ;
    }
}

class Home {
    constructor() {
        this.width = 150 ;
        this.height = 100 ;
        this.position = {x: (canvas.width/2) - (this.width/2), y: canvas.height - 200} ;

        let image = new Image() ;
        image.src = 'assets/home.jpg' ;
        image.onload = () => {
            this.image = image ;
        } ;
    }

    draw() {
        if (this.image) {
            c.drawImage(
                this.image,
                this.position.x,
                this.position.y,
                this.width,
                this.height
            )
        }
    }
}

let player = new Player() ;
let bullets = [] ;
let home = new Home() ;
let clusters = [] ;
let frames = 0 ;
let interval = 500 ;

// FUNCTIONS

// degree to radian
function radian(deg) {
    return (Math.PI / 180) * deg ;
}

// Draw background
function background() {
    gradient = c.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        50,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2
    ) ;
    gradient.addColorStop(0, "#b327e6") ;
    gradient.addColorStop(1, "#4c195e") ;
    c.fillStyle = gradient ;
    c.fillRect(0, 0, canvas.width, canvas.height) ;
}

// Check whether colliding ; radius coressponds to radius around cord2
function isCollide(cords1, cords2, radius) {
    let distance = Math.sqrt((cords1.x - cords2.x)**2 + (cords1.y - cords2.y)**2) ;
    if (distance > radius) {
        return false ;
    } else {
        return true ;
    }
}

// Generate random cluster with random size and random location
function genCluster() {
    let cWidth = 150 ;
    let cHeight = 80 ;
    let cPos = {x: Math.round((canvas.width - cWidth)*Math.random()), y:20} ;
    let locs = [] ;
    let newPos = {
        x: Math.round(cPos.x + (cWidth)*Math.random()),
        y: Math.round(cPos.y + (cHeight)*Math.random())
    } ;
    locs.push(newPos) ;
    let num = Math.round(2 + (3)*Math.random()) ;
    while (true) {
        newPos = {
            x: Math.round(cPos.x + (cWidth)*Math.random()),
            y: Math.round(cPos.y + (cHeight)*Math.random())
        } ;
        let cond = true ;
        locs.forEach((e) => {
            if (isCollide(newPos, e, 50)) {
                cond = false ;
            }
        }) ;
        if (cond) {
            locs.push(newPos) ;
        }
        if (locs.length === num) {
            break ;
        }
    }

    let cAngle = Math.atan(((cPos.y + cHeight/2) - (home.position.y + home.height/2)) / ((cPos.x + cWidth/2) - (home.position.x + home.width/2))) ;
    if (cPos.x < home.position.x) {
        cAngle += Math.PI ;
    }
    let cVelocity = {
        x: -2 * Math.cos(cAngle),
        y: -2 * Math.sin(cAngle)
    } ;

    let cluster = new Cluster(cPos, cVelocity) ;
    locs.forEach((loc) => {
        let bot =  new Bot(loc, cluster.velocity) ;
        cluster.bots.push(bot) ;
    }) ;

    return cluster ;
}

// MAIN GAME LOOP

function main() {
    window.requestAnimationFrame(main) ;
    background() ;

    // Draw home health bar
    c.fillStyle = "white" ;
    c.fillRect(20, 20, 300, 20) ;
    c.fillStyle = "#18eb09" ;
    if (health >= 0) {
        c.fillRect(20, 20, 300 * (health/maxHealth), 20) ;
    }

    // Check if game over
    if (health <= 0) {
        alert("Game Over! Score: " + score.toString()) ;
        score = 0 ;
        health = maxHealth ;
        clusters = [] ;
        bullets = [] ;
        player = new Player() ;
        interval = 500 ;
        frames = 0 ;
        paused = true ;
        playPause.style.backgroundImage = 'url("../assets/play.png")' ;
    }

    // Change velocity based on input
    if (pressedKey.a && !pressedKey.d && player.position.x > 20) {
        player.velocity.x = -5 ;
    } else if (pressedKey.d && !pressedKey.a && player.position.x < canvas.width - 20) {
        player.velocity.x = 5 ;
    } else {
        player.velocity.x = 0 ;
    }

    if (pressedKey.w && !pressedKey.s && player.position.y > 20) {
        player.velocity.y = -5 ;
    } else if (pressedKey.s && !pressedKey.w && player.position.y < canvas.height - 20) {
        player.velocity.y = 5 ;
    } else {
        player.velocity.y = 0 ;
    }

    // Draw score and high score
    c.font = "26px courier" ;
    c.fillStyle = "white" ;
    c.fillText("SCORE: " + score.toString(), canvas.width - 250, 40) ;
    c.fillText("HIGH SCORE: " + highScoreVal.toString(), canvas.width - 250, 70) ;

    // Draw home
    home.draw() ;

    // Draw player
    player.draw() ;

    // Draw clusters
    clusters.forEach((cluster) => {
        cluster.bots.forEach((bot, index) => {
            // If paused, set velocity to 0, else set to original value
            if (paused === true) {
                if (bot.velocity.x === bot.originalVelocity.x && bot.velocity.y === bot.originalVelocity.y) {
                    bot.velocity = {x:0, y:0} ;
                }
            } else {
                bot.velocity = bot.originalVelocity ;
            }

            // If any bullet hit the bot, remove the bullet and the bot, increase score
            for (let i = 0 ; i < bullets.length ; i++) {
                let bullet = bullets[i] ;
                let newPos = {
                    x: bot.position.x + 17,
                    y: bot.position.y + 17
                } ;
                if (isCollide(bullet.position, newPos, 17)) {
                    score += 10 ;
                    if (score > highScoreVal) {
                        highScoreVal = score ;
                        localStorage.setItem('highScore', JSON.stringify(highScoreVal)) ;
                    }
                    // Reduce interval for higher score
                    if (score % 100 === 0 && score > 0) {
                        if (interval >= 200) {
                            interval -= 100 ;
                        } else if (interval >= 50) {
                            interval -= 5 ;
                        }
                    }
        
                    setTimeout(() => {
                        bullets.splice(i, 1) ;
                        cluster.bots.splice(index, 1) ;
                    }, 0) ;
                    break ;
                }
            }

            // If bot went past the screen, remove the bot
            if (bot.position.y > canvas.height + 50) {
                setTimeout(() => {
                    cluster.bots.splice(index, 1) ;
                }, 0) ;
            }

            // If bot hit the home, remove bot, and reduce health
            let newPos = {
                x: home.position.x + (home.width / 2),
                y: home.position.y + (home.height / 2)
            } ;
            if (isCollide(bot.position, newPos, 75) || bot.position.y > home.position.y + 20) {
                setTimeout(() => {
                    cluster.bots.splice(index, 1) ;
                }, 0) ;
                health -= 5 ;
            }

            // Draw the bot
            bot.draw() ;
        }) ;
    }) ; 

    // Draw bullets
    bullets.forEach( (e, i) => {
        if (e.position.y < -20) {
            setTimeout(() => {
                bullets.splice(i, 1) ;
            }, 0) ;
        } else {
            e.draw() ;
        }
    }) ;
    
    if (!paused) {
        // Create cluster
        if (frames % interval === 0 && health > 0) {
            clusters.push(genCluster()) ;
            frames = 0 ;
        }

        frames += 1 ;
    }
}

// START GAME
let highScore = localStorage.getItem('highScore') ;
if (highScore == null) {
    localStorage.setItem('highScore', JSON.stringify(highScoreVal)) ;
} else {
    highScoreVal = JSON.parse(highScore) ;
}
window.requestAnimationFrame(main) ;

// INPUT CONTROL
window.addEventListener('keydown', (e) => {
    if (paused === false) {
        switch (e.key) {
            case 'a':
                pressedKey.a = true ;
                break ;
            case 'd':
                pressedKey.d = true ;
                break ;
            case 'w':
                pressedKey.w = true ;
                break ;
            case 's':
                pressedKey.s = true ;
                break ;
        }
    }
}) ;

window.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'a':
            pressedKey.a = false ;
            break ;
        case 'd':
            pressedKey.d = false ;
            break ;
        case 'w':
            pressedKey.w = false ;
            break ;
        case 's':
            pressedKey.s = false ;
            break ;
    }
}) ;

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX ;
    mouseY = e.clientY ;
}) ;

window.addEventListener('keydown', (e) => {
    if (e.key ==- " " && paused === false) {
        let angle = Math.atan((mouseY - player.position.y) / (mouseX - player.position.x)) ;
        if (mouseX < player.position.x) {
            angle += Math.PI ;
        }
        let velocity = {
            x: 10 * Math.cos(angle),
            y: 10 * Math.sin(angle)
        } ;
        let position = {
            x: player.position.x + 40 * Math.cos(angle),
            y: player.position.y + 40 * Math.sin(angle)
        } ;
        bullets.push(new Bullet(position, velocity)) ;
    }
}) ;

playPause.addEventListener('click', (e) => {
    paused = !paused ;
    if (paused === true) {
        playPause.style.backgroundImage = 'url("https://raw.githubusercontent.com/Arjun-G-04/delta-web-2/main/assets/play.png")' ;
    } else {
        playPause.style.backgroundImage = 'url("https://raw.githubusercontent.com/Arjun-G-04/delta-web-2/main/assets/pause.png")' ;
    }
    playPause.blur() ;
}) ;
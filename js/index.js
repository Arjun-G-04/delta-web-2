// VARIABLES

// Get the canva and context element
const canvas = document.getElementById("myCanvas") ;
const c = canvas.getContext('2d') ;

// Set canva full screen
canvas.width = window.innerWidth ;
canvas.height = window.innerHeight ;
document.body.style.overflow = 'hidden';

let pressedKey = {a:false, d:false} ;
let mouseX = 0 ;
let mouseY = 0 ;

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
        this.width = 100 ;
        this.height = 80 ;
        this.position = {x: (canvas.width/2) - (this.width/2), y: canvas.height - 200} ;
    }

    draw() {
        c.fillStyle = "yellow" ;
        c.fillRect(this.position.x, this.position.y, this.width, this.height) ;
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

    let cAngle = Math.atan((cPos.y - home.position.y) / (cPos.x - home.position.x)) ;
    if (cPos.x < home.position.x) {
        cAngle += Math.PI ;
    }
    let cVelocity = {
        x: -1 * Math.cos(cAngle),
        y: -1 * Math.sin(cAngle)
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

    // Change velocity based on input
    if (pressedKey.a && !pressedKey.d && player.position.x > 20) {
        player.velocity.x = -5 ;
    } else if (pressedKey.d && !pressedKey.a && player.position.x < canvas.width - 20) {
        player.velocity.x = 5 ;
    } else {
        player.velocity.x = 0 ;
    }

    // Draw home
    home.draw() ;

    // Draw player
    player.draw() ;

    // Draw clusters
    clusters.forEach((cluster) => {
        cluster.bots.forEach((bot, index) => {
            // If any bullet hit the bot, remove the bullet and the bot
            for (let i = 0 ; i < bullets.length ; i++) {
                let bullet = bullets[i] ;
                let newPos = {
                    x: bot.position.x + 17,
                    y: bot.position.y + 17
                } ;
                if (isCollide(bullet.position, newPos, 17)) {
                    setTimeout(() => {
                        bullets.splice(i, 1) ;
                        cluster.bots.splice(index, 1) ;
                    }, 0) ;
                    break ;
                }
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

    // Create cluster
    if (frames % interval == 0) {
        clusters.push(genCluster()) ;
        frames = 0 ;
    }

    frames += 1 ;
}

// START GAME
window.requestAnimationFrame(main) ;

// INPUT CONTROL
window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'a':
            pressedKey.a = true ;
            break ;
        case 'd':
            pressedKey.d = true ;
            break ;
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
    }
}) ;

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX ;
    mouseY = e.clientY ;
}) ;

window.addEventListener('keydown', (e) => {
    if (e.key == " ") {
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
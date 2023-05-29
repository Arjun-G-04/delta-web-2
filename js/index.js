// VARIABLES

// Get the canva and context element
const canvas = document.getElementById("myCanvas") ;
const c = canvas.getContext('2d') ;

// Set canva full screen
canvas.width = window.innerWidth ;
canvas.height = window.innerHeight ;
document.body.style.overflow = 'hidden';

let pressedKey = {a:false, d:false} ;

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

let player = new Player() ;
let bullets = [] ;

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

    // Draw player
    player.draw() ;

    // Draw bullets
    bullets.forEach(e => {
        e.draw() ;
    }) ;
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

window.addEventListener('click', e => {
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
}) ;
// Get the canva and context element
const canvas = document.getElementById("myCanvas") ;
const c = canvas.getContext('2d') ;

// Set canva full screen
canvas.width = window.innerWidth ;
canvas.height = window.innerHeight ;

// degree to radian
function radian(deg) {
    return (Math.PI / 180) * deg ;
}

// Player object
class Player {
    constructor() {
        this.position = {x:200, y:200} ;
        this.velocity = {x:0, y:0} ;

        this.radius = 20 ;
        this.angle = radian(270) ;
    }

    draw() {
        // circle part
        c.fillStyle = 'red' ;
        c.arc(this.position.x, this.position.y, this.radius, 0, 2*Math.PI) ;
        c.fill() ;

        // gun part
        c.save() ;
        c.translate(this.position.x, this.position.y) ;
        c.rotate(this.angle) ;
        c.globalCompositeOperation = 'destination-over' ;
        c.fillStyle = 'purple' ;
        c.fillRect(0, -5, 40, 10) ;
        c.restore() ;
    }
}

player = new Player() ;
player.draw() ;
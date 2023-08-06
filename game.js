let arena   = Arena.init('arena');
let player  = Player.new();
/*
Block.new();
Block.new();
Block.new();
console.log(Ob.list);
console.log(player);
*/


let game    = Game.new();
let heroi   = document.querySelector('#heroi');

/*
game.bind( 'mousedown', [0], () => console.log('Pah' ) );
game.bind( 'mouseup', [2], () => console.log('Shiiiouu' ) );
game.bind( 'mouseup', [0], () => console.log('arrr' ) );
*/

game.keydown = (ev, key, code) => {
  // console.log( key, code, ev );
  if ( !['F5','F11','F12'].includes( code ) ) {
    ev.preventDefault();
  }
};

game.start = () => {
}

let sprites = {
  parado  : [
    'menino/parado1.png',
    'menino/parado1.png',
    'menino/parado1.png',
    'menino/parado1.png',
    'menino/parado1.png',
    'menino/parado1.png',
    'menino/parado1.png',
    'menino/parado1.png',
    'menino/parado3.png',
    'menino/parado4.png',
    'menino/parado3.png',
    'menino/parado2.png',
  ],
  andando  : [
    'menino/andando1.png',
    'menino/andando2.png',
    'menino/andando3.png',
    'menino/andando4.png',
    'menino/andando5.png',
    'menino/andando6.png',
  ],
};
let sprite  = 0;
let last    = 0;
let framesT = 0;
let framesP = 150;
let framesA = 100;

game.update = (dt) => {
  let movingY   = 0;
  let movingX   = 0;
  let now       = new Date().getTime();
  let dif       = now - last;
  last          = now;

  if ( game.pressing.up || game.pressing.w ) {
    movingY     = -1;
  } else if ( game.pressing.down || game.pressing.s ) {
    movingY     = 1;
  }

  if ( game.pressing.left || game.pressing.a ) {
    movingX     = -1;
    heroi.classList.contains( 'flip' ) || heroi.classList.add( 'flip' )
  } else if ( game.pressing.right || game.pressing.d ) {
    movingX     = 1;
    !heroi.classList.contains( 'flip' ) || heroi.classList.remove( 'flip' )
  }

  framesT += dif;

  if ( movingX && framesT > framesA ) {
    framesT = 0;
    sprite++;
    if ( sprite >= sprites.andando.length ) sprite = 0
    heroi.src = "public/img/sprites/" + sprites.andando[sprite];
  } else if ( !movingX && framesT > framesP ) {
    framesT = 0;
    sprite++;
    if ( sprite >= sprites.parado.length ) sprite = 0
    heroi.src = "public/img/sprites/" + sprites.parado[sprite];
  }

  let deltaDiag = movingY && movingX
    ? 0.8
    : 1;

  if ( movingY ) {
    let top  = heroi.style.top.replace( /\D/g, '' ) - 0;
    heroi.style.top = Math.round( top + 100 * dt * movingY * deltaDiag, 0 ) + 'px';
  }
  
  if ( movingX ) {
    let left = heroi.style.left.replace( /\D/g, '' ) - 0;
    heroi.style.left = Math.round( left + 100 * dt * movingX * deltaDiag, 0 ) + 'px';
  }

  if ( game.pressing.mouse0 ) console.log('ra');
};

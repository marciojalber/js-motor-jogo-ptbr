class Ob {
  static #list = {};
  static #nextId  = 1;
  #type;
  #id;

  constructor(type) {
    this.#type          = type;
    this.#id            = Ob.#nextId;
    Ob.#list[ this.id ] = this;
    Ob.#nextId++;
  }

  get id() {
    return this.#id;
  }

  static get list() {
    return Ob.#list;
  }
}

class Arena extends Ob {
  static #key = Math.random();
  static #instance;

  #el;
  #width  = 800;
  #height = 600;

  constructor(type, key) {
    if ( key != Arena.#key ) {
      throw new Error( `Use o método Arena.init() pra criar uma instância.` );
    }

    if ( Arena.#instance ) {
      throw new Error( 'Você já criou a arena #' + Arena.it.id );
    }

    super(type);
    Arena.#instance = this;
  }

  static init(el) {
    if ( !document.querySelector('#' + el) ) {
      throw new Error( `Elemento [${el}] inexistente.` );
    }

    let instance = new Arena( 'Arena', Arena.#key );
    instance.#el = el;

    return instance;
  }

  static get it() {
    return Arena.#instance;
  }

  static get el() {
    return document.querySelector( '#' + Arena.it.#el );
  }
}

class SVG {
  static #svgNS = "http://www.w3.org/2000/svg";

  static create(id, ...children) {
    let svg = document.createElementNS(SVG.#svgNS, "svg");
    svg.setAttributeNS(null,"id","svg_" + id);
    svg.setAttributeNS(null,"width","50px");
    svg.setAttributeNS(null,"height","50px");
    
    for ( let i in children ) {
      svg.appendChild(children[i]);
    }

    return svg;
  }

  static createSquare() {
    let square = document.createElementNS(SVG.#svgNS, "rect");
    square.setAttributeNS(null,"x","0");
    square.setAttributeNS(null,"y","0");
    square.setAttributeNS(null,"width","100%");
    square.setAttributeNS(null,"height","100%");
    square.setAttributeNS(null,"fill","black");
    return square;
  }
}

class Block extends Ob {
  constructor() {
    super('Block');
    let square  = SVG.createSquare();
    let svg     = SVG.create(this.id, square);
    Arena.el.appendChild(svg);
  }

  static new() {
    let instance = new Block();
    return instance;
  }
}

class Game {
  static #instance    = false;
  #actions            = {};
  #binds              = {};
  #lastTick           = 0;
  #inputs             = [];
  #pressing           = {};

  static new() {
    if ( Game.#instance ) return console.log( "O jogo já começou a rodar." );

    Game.#instance    = new Game();
    document.body.onkeydown     = Game.#instance.#_keydown;
    document.body.onkeyup       = Game.#instance.#_keyup;
    
    document.body.onclick       = Game.#instance.#_click;
    document.body.onauxclick    = Game.#instance.#_click;
    document.body.oncontextmenu = Game.#instance.#_click;
    document.body.ondblclick    = Game.#instance.#_dblclick;
    document.body.onmousedown   = Game.#instance.#_mousedown;
    document.body.onmouseup     = Game.#instance.#_mouseup;
    document.body.onwheel       = Game.#instance.#_wheel;
    document.body.onmousemove   = Game.#instance.#_mousemove;

    Game.it.lastTick = window.performance.now();
    window.requestAnimationFrame(Game.#instance.#loop);

    return Game.#instance;
  }

  static get it() {
    return Game.#instance;
  }

  #loop() {
    let game      = Game.it;
    let perf_now  = window.performance.now();
    let delta     = 1 / (perf_now - game.lastTick);
    game.lastTick = perf_now;
    
    game.start && game.start();
    game.processInput();
    game.update && game.update( delta );
    // this.render();

    window.requestAnimationFrame(Game.#instance.#loop);
  }

  #_keydown( ev ) {
    let key   = ev.key.toLowerCase().replace('arrow', '').replace('control', 'ctrl');
    let game  = Game.it;
    game.keydown && game.#inputs.push( () => game.keydown( ev, key, ev.code ));
    game.execBind( 'keydown', ev, key, ev.code );
    game.pressing[key] = {
      ctrl  : ev.ctrlKey,
      shift : ev.shiftKey,
      alt   : ev.shiftKey,
    };
  }

  #_keyup( ev ) {
    let key   = ev.key.toLowerCase().replace('arrow', '').replace('control', 'ctrl');
    let game  = Game.it;
    game.keyup && game.#inputs.push( () => game.keyup( ev, key, ev.code ) );
    game.execBind( 'keyup', ev, key, ev.code );
    delete game.pressing[key];
  }
  
  #_click( ev ) {
    let game  = Game.it;
    game.click && game.#inputs.push( () => game.click( ev, ev.button ) );
    game.execBind( 'click', ev, ev.button );
    return false;
  }

  #_dblclick( ev ) {
    let game  = Game.it;
    game.dblclick && game.#inputs.push( () => game.dblclick( ev, ev.button ) );
    game.execBind( 'dblclick', ev, ev.button );
  }

  #_mousedown( ev ) {
    let game  = Game.it;
    game.mousedown && game.#inputs.push( () => game.mousedown( ev, ev.button ) );
    game.execBind( 'mousedown', ev, ev.button );
    game.pressing['mouse' + ev.button] = {
      ctrl  : ev.ctrlKey,
      shift : ev.shiftKey,
      alt   : ev.shiftKey,
    };
  }

  #_mouseup( ev ) {
    let game  = Game.it;
    game.mouseup && game.#inputs.push( () => game.mouseup( ev, ev.button ) );
    game.execBind( 'mouseup', ev, ev.button );
    delete game.pressing['mouse' + ev.button];
  }

  #_wheel( ev ) {
    let game  = Game.it;
    game.wheel && game.#inputs.push( () => game.wheel( ev, ev.deltaY ) );
    game.execBind( 'wheel', ev, ev.deltaY );
  }

  #_mousemove( ev ) {
    let game  = Game.it;
    game.mousemove && game.#inputs.push( () => game.mousemove( ev, ev.movementX, ev.movementY ) );
    game.execBind( 'mousemove', ev, ev.movementX, ev.movementY );
  }

  execBind( event, ev, val1, val2 ) {
    let game  = Game.it;
    let key   = `${event}.${val1}`;
    if ( !game.#binds[key] ) return;
    let action = game.#binds[key];
    typeof action == 'string'
      ? game.#inputs.push( () => game.#actions[action](ev, val1, val2) )
      : game.#inputs.push( () => action(ev, val1, val2) );
  }

  get pressing() {
    return Game.it.#pressing;
  }

  processInput() {
    let inputs = Game.it.#inputs;
    let fn;
    for ( let i in inputs ) {
      inputs[i]();
    }
    Game.it.#inputs = [];
  }

  setAction( name, fn ) {
    Game.it.#actions[ name ] = fn;
  }

  removeAction( name ) {
    delete Game.it.#actions[ name ];
  }

  clearActions() {
    Game.it.#actions = {};
  }

  get actions() {
      return Game.it.#actions;
  }

  bind( event, keys, action ) {
    let events = [
      'keydown',
      'keyup',
      'click',
      'auxclick',
      'contextmenu',
      'dblclick',
      'mousedown',
      'mouseup',
      'wheel',
      'mousemove',
    ];
    
    if ( !events.includes( event ) ) {
      return console.error( 'Evento "event" não é um evento válido [' + events.join(', ') + ']' );
    }

    let binds = Game.it.#binds;
    if ( !Array.isArray( keys ) ) keys = [keys];
    keys.map( key => binds[ `${event}.${key}` ] = action );
  }
}

class Player extends Ob {
  constructor() {
    super('Player');
  }

  static new() {
    return new Player();
  }
}

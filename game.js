// kaboom();
kaboom({
  global: true,
  fullscreen: true,
  scale: 2,
  debug: true,
  clearColor: [0, 0, 0, 1],
})

// Load sprites
loadSprite('coin', 'images/wbKxhcd.png')
loadSprite('evil-shroom', 'images/KPO3fR9.png')
loadSprite('brick', 'images/pogC9x5.png')
loadSprite('block', 'images/M6rwarW.png')
loadSprite('mario', 'images/Wb1qfhK.png')
loadSprite('mushroom', 'images/0wMd92p.png')
loadSprite('surprise', 'images/gesQ1KP.png')
loadSprite('unboxed', 'images/bdrLpi6.png')
loadSprite('pipe-top-left', 'images/ReTPiWY.png')
loadSprite('pipe-top-right', 'images/hj2GK4n.png')
loadSprite('pipe-bottom-left', 'images/c1cYSbt.png')
loadSprite('pipe-bottom-right', 'images/nqQ79eI.png')
loadSprite('blue-block', 'images/fVscIbn.png')
loadSprite('blue-brick', 'images/3e5YRQd.png')
loadSprite('blue-steel', 'images/gqVoI2b.png')
loadSprite('blue-evil-shroom', 'images/SvV4ueD.png')
loadSprite('blue-surprise', 'images/RMqCc1G.png')
loadSprite('boss', 'images/boss.png')
loadSprite('apple', 'images/apple.png')

// Initialize the game scene
scene('game', ({ 
  level, score, moveSpeed, jumpForce, bigJumpForce, 
  currentJumpForce, fallDeath, enemySpeed, mybulletCnt, 
  mystairMove, mybadMove, levelp, mypower, isJumping ,myBig=0,mylife=1
}) => {

  // Initialize game state with provided parameters
  let MOVE_SPEED = moveSpeed;
  let JUMP_FORCE = jumpForce;
  let BIG_JUMP_FORCE = bigJumpForce;
  let CURRENT_JUMP_FORCE = currentJumpForce;
  const FALL_DEATH = fallDeath;
  const ENEMY_SPEED = enemySpeed;
  let bulletCnt = mybulletCnt;
  let mylevel = levelp;
  let power = mypower;
  let life=mylife;

  let isBig = myBig === 1;

  layers(['bg', 'obj', 'ui'], 'obj');

  const maps = [
      [
          '                                                  -+     ',
          '                                                 ()     ',
          '                                                 ====   ',
          '                                                        ',
          '                                                >        ',
          '                                                        ',
          '                                                        ',
          '                                  >           >           ',
          '                                                        ',
          '                          >             =====          ',
          '                               =====                   ',
          '     k   =*=%=   D                                     ',
          '                        =====                       ==  ',
          ' -+                 >                                     ',
          ' ()                ^  ^                                 ',
          '=======================      ?       =    ?      =====',
          '                                                        ',
          '                                                         ',
          '                                                          ',
          '                                                          '
      ],
      [
          '£                                                            £',
          '£                                                            £',
          '£                                                           £',
          '£                                             >            £',
          '£                                     >                    £',
          '£        @@@@@@   ?          x x                       >   £',
          '£                          x x x                          £',
          '£                        x x x x  x  !!!!!!!!!!!!!!!   -+£',
          '£               z   z  x x x x x  x                    ()£',
          '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!                  !!!!!',
      ]
  ];

  const levelCfg = {
      width: 20,
      height: 20,
      '=': [sprite('block'), solid()],
      '$': [sprite('coin'), 'coin'],
      '%': [sprite('surprise'), solid(), 'coin-surprise'],
      'k': [sprite('surprise'), solid(), 'apple-surprise'],
      '*': [sprite('surprise'), solid(), 'mushroom-surprise'],
      '}': [sprite('unboxed'), solid()],
      '(': [sprite('pipe-bottom-left'), solid(), scale(0.5)],
      ')': [sprite('pipe-bottom-right'), solid(), scale(0.5)],
      '-': [sprite('pipe-top-left'), solid(), scale(0.5), 'pipe'],
      '+': [sprite('pipe-top-right'), solid(), scale(0.5)],
      '^': [sprite('evil-shroom'), solid(), 'dangerous'],
      '#': [sprite('mushroom'), solid(), 'mushroom', body()],
      '!': [sprite('blue-block'), solid(), scale(0.5)],
      '£': [sprite('blue-brick'), solid(), scale(0.5)],
      'z': [sprite('blue-evil-shroom'), solid(), scale(0.5), 'dangerous'],
      '@': [sprite('blue-surprise'), solid(), scale(0.5), 'coin-surprise'],
      'x': [sprite('blue-steel'), solid(), scale(0.5)],
      '?': [rect(70, 10), color(0, 1, 0), solid(), 'upstair'],
      '>': [rect(70, 10), color(1, 0, 0), solid(), 'lift'],
      'a': [sprite('apple'), solid(),scale(0.1,0.1), 'apple'],
  };

  function initializeHealth(obj, initialHealth) {
      obj.health = initialHealth;
      obj.maxHealth = initialHealth;
  }

  const gameLevel = addLevel(maps[level], levelCfg);

  const scoreLabel = add([
      text(score),
      pos(0, 0),
      layer('ui'),
      {
          value: score,
          update() {
            this.pos = camPos().sub(width() / 2, height() / 2).add(10, 10);
              this.text = `Score: ${this.value} life:${mylife}  Emos:${bulletCnt} Boss:${power} Level:${level + 1}`;
          }
      }
  ]);

  function big() {
      return {
          update() {
              if (isBig==1) {
                    player.collides('dangerous',(d)=>{
                    destroy(d);
                    player.smallify();
                  })
              }
          },
          isBig() {
              return isBig;
          },
          smallify() {
              this.scale = vec2(1);
              isBig = 0;
          },
          biggify() {
              this.scale = vec2(2);
              isBig = 1;
          }
      };
  }

  //player detail
  const player = add([
      sprite('mario'), solid(),
      pos(30, 0),
      body(),
      big(),
      origin('bot')
  ]);

  initializeHealth(player, 1);
  mylife=player.health;
  
  
  player.on("headbump", (obj) => {
    if (obj.is('coin-surprise')) {
        gameLevel.spawn('$', obj.gridPos.sub(0, 1));
        destroy(obj);
        gameLevel.spawn('}', obj.gridPos.sub(0, 0));
    }
    if (obj.is('apple-surprise')) {
        gameLevel.spawn('a', obj.gridPos.sub(0, 1));
        destroy(obj);
        gameLevel.spawn('}', obj.gridPos.sub(0, 0));
    }
    if (obj.is('mushroom-surprise')) {
        gameLevel.spawn('#', obj.gridPos.sub(0, 1));
        destroy(obj);
        gameLevel.spawn('}', obj.gridPos.sub(0, 0));
    }
});

 if (isBig==1) {
      player.biggify();
  } else {
      player.smallify();
 }

player.collides('dangerous',(d)=>{
    if(isBig){
      player.smallify();
    } else {
        if (isJumping) {
            destroy(d);
            bulletCnt++;
        } else {
            go('lose', { score: scoreLabel.value });
        }
    }
 })
    
player.collides('mushroom', (m) => {
    destroy(m);
    player.biggify();
});

player.collides('coin', (c) => {
    destroy(c);
    scoreLabel.value++;
    scoreLabel.text = scoreLabel.value;
});

player.collides('apple', (a) => {
    destroy(a);
    player.health+=1;
    mylife=player.health
    // console.log(player.health)
    // console.log(mylife)
});

player.collides('lift', (l) => {
    destroy(l);
    player.jump(500);
});

player.collides('dangerous', (d) => {
    console.log(mylife)
    if (player.health>1) {
        destroy(d);
        player.health-=1
    } else {
        go('lose', { score: scoreLabel.value });
    }
});

// player.collides('dangerous', (d) => {
//     console.log(mylife)
//     if (isJumping) {
//         destroy(d);
//         bulletCnt++;
//     } else {
//         go('lose', { score: scoreLabel.value });
//     }
// });


player.action(() => {
    camPos(player.pos);

    if (player.pos.y >= FALL_DEATH) {
        go('lose', { score: scoreLabel.value });
    }
});

player.collides('pipe', () => {
    keyPress('down', () => {
      console.log('Transitioning to next level with isBig:', isBig);
        go('game', {
            level: (level + 1) % maps.length,
            score: scoreLabel.value,
            moveSpeed: MOVE_SPEED,
            jumpForce: JUMP_FORCE,
            bigJumpForce: BIG_JUMP_FORCE,
            currentJumpForce: CURRENT_JUMP_FORCE,
            fallDeath: FALL_DEATH,
            enemySpeed: ENEMY_SPEED,
            mybulletCnt: bulletCnt,
            mystairMove: mystairMove,
            mybadMove: mybadMove,
            levelp: mylevel,
            mypower: power,
            isJumping: isJumping,
            myBig: isBig 
        });
    });
});

player.action(() => {
    if (player.grounded()) {
        isJumping = false;
    }
});

//player movement
keyDown('left', () => {
    player.move(-MOVE_SPEED, 0);
});

keyDown('right', () => {
    player.move(MOVE_SPEED, 0);
});

keyPress('space', () => {
    if (player.grounded()) {
        isJumping = true;
        player.jump(CURRENT_JUMP_FORCE);
    }
});

  // boss detail
  if (mylevel === 1) {
    const boss = add([
        sprite('boss'),
        solid(),
        scale(0.2, 0.3),
        pos(100, 240), 
        'bad', // Tag as 'bad'
    ]);

    initializeHealth(boss, 5);
    mylevel = 2;

    player.collides('bad', (b) => {
        destroy(player);
    });

    // Function to spawn boss bullets
    function spawnBossBullet() {
        const bossBullet = add([
            rect(8, 4),
            pos(boss.pos.x - 10, boss.pos.y+20),
            solid(),
            color(0, 0, 1),
            origin("center"),
            "bossBullet",
        ]);

        bossBullet.action(() => {
            bossBullet.move(-200, 0);
            if (bossBullet.pos.x < 0) {
                destroy(bossBullet);
            }
            player.collides('bossBullet', (b) => {
                destroy(b);
                destroy(player);
              })
        });
    }

    // Loop to spawn bullets at regular intervals
    loop(1, () => { // Spawns a bullet every 1 seconds
        if(boss.health === 0) return
        spawnBossBullet();
    });
}


  // Custom events
  action('mushroom', (m) => {
      m.move(20, 0);
  });


  action('dangerous', (d) => {
      d.move(-ENEMY_SPEED, 0);
  });

  action('bad', (s) => {
      if (!s.initialPos) {
          s.initialPos = s.pos.x;
          s.badMove = -20;
      }

      if (s.pos.x <= s.initialPos - 10 || s.pos.x >= s.initialPos + 100) {
          s.badMove = -s.badMove; 
      }
      s.move(s.badMove, 0);
  });

  action('upstair', (s) => {
      if (!s.initialPos) {
          s.initialPos = s.pos.x;
          s.stairMove = -40;
          side=(s.stairMove/2);
      }

      if (s.pos.x <= s.initialPos - 100 || s.pos.x >= s.initialPos + 100) {
          s.stairMove = -s.stairMove; // Reverse the direction
          side=(s.stairMove/2);
      }
      s.move(s.stairMove, -side);
  });


  //skateboard 
  keyPress('a', () => {

      const board = add([
        rect(30, 6), 
        pos(player.pos.x-4, player.pos.y-6),
        solid(),
        color(0, 1, 0), 
        origin("center"),
        "board", 
      ]);

      if (board.pos.x < 0 || board.pos.x > width()) {
          destroy(board);
      }

      board.action(() => {
        board.move( 100, 0);
        board.collides('bad',(b) => {
            b.health=0;
            destroy(board);
            destroy(b);
        })
        board.collides('dangerous',(d) => {
          destroy(board);
          destroy(d);
      })

    });

  });


  //bullet movement
  keyPress('q', () => {
     if(bulletCnt<=0) return

      bulletCnt--;

      const bullet = add([
        rect(8, 4), 
        pos(player.pos.x+10, player.pos.y-12),
        solid(),
        color(1, 0, 0), 
        origin("center"),
        "bullet", 
      ]);

      bullet.action(() => {
          bullet.move( 400, 0);
          if (bullet.pos.x < 0 || bullet.pos.x > width()) {
              destroy(bullet);
          }
      });

      bullet.collides('dangerous', (d) => {
        destroy(d);
        destroy(bullet);
      })

      bullet.collides('bad', (s) => {
          if (s.health > 1) {
              s.health--;
              destroy(bullet);
              power = s.health;
          } else {
              destroy(s);
              destroy(bullet);
              s.health=0;
              power = 0;
          }
          
      });

  });

});

// Lose scene
scene('lose', ({ score }) => {
  add([text(score, 32), origin('center'), pos(width() / 2, height() / 2)]);
  keyPress('space', () => {
      go('game', {
          level: 0,
          score: 0,
          moveSpeed: 120,
          jumpForce: 360,
          bigJumpForce: 550,
          currentJumpForce: 360,
          fallDeath: 400,
          enemySpeed: 20,
          mybulletCnt: 5,
          mystairMove: 0,
          mybadMove: 0,
          levelp: 1,
          mypower: 5,
          isJumping: false,
          mybig:false
      });
  });
});

// Start the game
start('game', {
  level: 0,
  score: 0,
  moveSpeed: 120,
  jumpForce: 360,
  bigJumpForce: 550,
  currentJumpForce: 360,
  fallDeath: 400,
  enemySpeed: 20,
  mybulletCnt: 5,
  mystairMove: 0,
  mybadMove: 0,
  levelp: 1,
  mypower: 5,
  isJumping: false,
  mybig:true
});

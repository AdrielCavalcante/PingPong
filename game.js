// Obtém referência para o canvas e contexto 2D
const canvas = document.getElementById('canvas');
const iniciar = document.getElementById('jogar');
const video = document.getElementById('video');
const antiVideo = document.getElementById('anti-video');
const titulo = document.getElementById('titulo');
const ctx = canvas.getContext('2d');
const colisaoAudio = new Audio('http://freesoundeffect.net/sites/default/files/ping-pong-paddle-hitting-ball-2-sound-effect-33413697.mp3');
const tema = new Audio('https://soundboardguy.com/wp-content/uploads/2021/04/Rick-Astley-Never-Gonna-Give-You-Up-Video.mp3');

// Define as dimensões do canvas
const width = canvas.width;
const height = canvas.height;

// Define as propriedades da bola
const ball = {
  x: width / 2,
  y: height / 2,
  radius: 10,
  speed: 5,
  dx: 5,
  dy: -5
};

// Define as propriedades das raquetes
const paddle1 = {
  x: 20,
  y: height / 2 - 50,
  width: 10,
  height: 100,
  speed: 5,
  dy: 0
};

const paddle2 = {
  x: width - 30,
  y: height / 2 - 50,
  width: 10,
  height: 100,
  speed: 5,
  dy: 0
};

// Define a função para desenhar a bola
function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.closePath();
}

// Define a função para desenhar as raquetes
function drawPaddles() {
  // Raquete do jogador 1
  ctx.beginPath();
  ctx.rect(paddle1.x, paddle1.y, paddle1.width, paddle1.height);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.closePath();

  // Raquete do jogador 2
  ctx.beginPath();
  ctx.rect(paddle2.x, paddle2.y, paddle2.width, paddle2.height);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.closePath();
}

// Define a função para desenhar o placar
function drawScore() {
  ctx.font = '20px Arial';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText(`Player 1: ${player1Score} - Player 2: ${player2Score}`, width / 2, 30);
}

// Define a função para atualizar a posição da bola
function updateBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Verifica colisão com as paredes superior e inferior
  if (ball.y + ball.radius > height || ball.y - ball.radius < 0) {
    ball.dy = -ball.dy;
  }

  // Verifica colisão com as raquetes
  if (ball.x - ball.radius < paddle1.x + paddle1.width &&
      ball.y > paddle1.y &&
      ball.y < paddle1.y + paddle1.height) {
    ball.dx = -ball.dx;
    colisaoAudio.play();
  }

  if (ball.x + ball.radius > paddle2.x &&
      ball.y > paddle2.y &&
      ball.y < paddle2.y + paddle2.height) {
    ball.dx = -ball.dx;
    colisaoAudio.play();
  }

  // Verifica se a bola saiu da tela
  if (ball.x + ball.radius < 0 || ball.x - ball.radius > width) {
    if (ball.x - ball.radius > width) {
      player1Score++;
    } else {
      player2Score++;
    }
    // Define a posição inicial da bola
    ball.x = width / 2;
    ball.y = height / 2;
    ball.dx = -ball.dx;
    }
}

// Define a função para atualizar a posição da raquete
function updatePaddle(paddle) {
    paddle.y += paddle.dy;
    
    // Verifica se a raquete saiu da tela
    if (paddle.y < 0) {
    paddle.y = 0;
    } else if (paddle.y + paddle.height > height) {
    paddle.y = height - paddle.height;
    }
}
    
// Define a função para desenhar o jogo
function draw() {
    // Limpa o canvas
    ctx.clearRect(0, 0, width, height);

    // Desenha a bola, as raquetes e o placar
    drawBall();
    drawPaddles();
    drawScore();
}

// Cria a conexão com o servidor Socket.io
const socket = io();

// Define as variáveis para armazenar o placar dos jogadores
let player1Score = 0;
let player2Score = 0;

// Envia a posição da raquete do jogador 1 para o servidor
function sendPaddlePosition() {
    socket.emit('paddle position', paddle1.y);
}

// Atualiza a posição da raquete do jogador 2 com base no valor recebido do servidor
socket.on('paddle position', function(position) {
    paddle2.y = position;
});

// Atualiza a posição da raquete do jogador 1 com base nas teclas pressionadas
document.addEventListener('keydown', function(event) {
    if (event.code === 'KeyW') {
        paddle1.dy = -paddle1.speed;
    } else if (event.code === 'KeyS') {
        paddle1.dy = paddle1.speed;
    }

    if (event.code === 'ArrowUp') {
        paddle2.dy = -paddle2.speed;
    } else if (event.code === 'ArrowDown') {
        paddle2.dy = paddle2.speed;
    }
});

document.addEventListener('keyup', function(event) {
    if (event.code === 'KeyW' || event.code === 'KeyS') {
        paddle1.dy = 0;
    } else if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
        paddle2.dy = 0;
    }
});

function setupControls() {
    document.addEventListener("keydown", function (event) {
      if (event.keyCode === 87) { // tecla W
        player1.moveUp();
      } else if (event.keyCode === 83) { // tecla S
        player1.moveDown();
      } else if (event.keyCode === 38) { // tecla de seta para cima
        player2.moveUp();
      } else if (event.keyCode === 40) { // tecla de seta para baixo
        player2.moveDown();
      }
    });
  }

// Define a função para atualizar o jogo a cada quadro
function update() {
    iniciar.style.display = "none";

    antiVideo.style.zIndex = "2";
    
    video.style.display = "block";

    titulo.style.color = "white";

    tema.volume = 0.25;

    tema.loop = true;

    tema.play();

    // Atualiza a posição da bola e das raquetes
    updateBall();
    updatePaddle(paddle1);
    updatePaddle(paddle2);

    // Desenha o jogo
    draw();

    // Envia a posição da raquete do jogador 1 para o servidor
    sendPaddlePosition();

    // Solicita o próximo quadro de animação
    requestAnimationFrame(update);
}
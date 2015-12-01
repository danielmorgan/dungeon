import Konva from 'konva';

window.addEventListener('load', function() {
  const grid = {
    size: 6,
    width: 900 + 1,
    height: 600 + 1
  };

  let stage = new Konva.Stage({
    container: 'game',
    width: grid.width,
    height: grid.height
  });
  let backgroundLayer = new Konva.Layer();
  let gridLayer = new Konva.Layer();
  let roomsLayer = new Konva.Layer();
  let corridorLayer = new Konva.Layer();

  for (let i = 0; i < stage.getWidth() / grid.size; i++) {
    let verticalLine = new Konva.Line({
      points: [
        i * grid.size - 0.5,
        0 - 0.5,
        i* grid.size - 0.5,
        grid.height - 0.5
      ],
      stroke: '#ddd',
      strokeWidth: 1
    });
    let horizontalLine = new Konva.Line({
      points: [
        0 - 0.5,
        i * grid.size - 0.5,
        grid.width - 0.5,
        i * grid.size - 0.5
      ],
      stroke: '#eee',
      strokeWidth: 1
    });

    gridLayer.add(verticalLine, horizontalLine);
  }
  gridLayer.x(1);
  gridLayer.y(1);

  function generateRoom(id, minLength, maxLength) {
    let width = (randomInt(minLength, maxLength) + 1) * grid.size;
    let height = (randomInt(minLength, maxLength) + 1) * grid.size;
    let x = randomInt(1, (grid.width - width - grid.size) / grid.size - 1) * grid.size - (grid.size) + 0.5;
    let y = randomInt(1, (grid.height - height - grid.size) / grid.size - 1) * grid.size - (grid.size) + 0.5;

    return {
      id: id,
      width: width,
      height: height,
      x: x,
      y: y
    }
  }

  let rooms = [];
  let roomLimit = 100;
  let i;
  for (i = 0; i < 1000; i++) {
    let room = generateRoom(i, 4, 8);

    if (! collidesWithExistingRooms(room)) {
      rooms.push(room);
    }

    if (rooms.length >= roomLimit) {
      break;
    }
  }
  console.log('Generated', rooms.length, 'rooms in', i, 'attempts');

  function collidesWithExistingRooms(rect) {
    for (let existingRoom of rooms) {
      if (
        rect.x                - (grid.size) < existingRoom.x + existingRoom.width   &&
        rect.x + rect.width   + (grid.size) > existingRoom.x                        &&
        rect.y                - (grid.size) < existingRoom.y + existingRoom.height  &&
        rect.y + rect.height  + (grid.size) > existingRoom.y
      ) {
        return true;
      }
    }

    return false;
  }

  function randomRgba(alpha = 1) {
    return 'rgba('+randomInt(0, 20)+', '+randomInt(20, 120)+', '+randomInt(100, 220)+', '+alpha+')';

  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }



  // build graph
  let graph = []
  let id = 0;
  for (let y = 0; y < (stage.getHeight() / grid.size) - 1; y++) {
    for (let x = 0; x < (stage.getWidth() / grid.size) - 1; x++) {
      graph.push({
        id: id++,
        x: x,
        y: y,
        visited: false
      });
    }
  }
  
  // hunt-and-kill algorithm
  let directions = [
    { x: 0, y: -1 }, // north
    { x: 1, y: 0 }, // east
    { x: 0, y: 1 }, // south
    { x: -1, y: 0 } // west
  ];

  function visitCells() {
    let randomCell = graph[randomInt(0, graph.length)];
    randomCell.visited = true;

    let cellGraphic = new Konva.Rect({
      x: randomCell.x * grid.size,
      y: randomCell.y * grid.size,
      width: grid.size,
      height: grid.size,
      fill: 'rgba(0, 0, 0, 0.25)'
    });
    corridorLayer.add(cellGraphic);

    let randomDirection = directions[randomInt(0, 3)];
    console.log(randomDirection);
  }

  visitCells();










  for (let room of rooms) {
    let roomGraphic = new Konva.Rect({
      x: room.x,
      y: room.y,
      width: room.width,
      height: room.height,
      fill: randomRgba(0.5)
    });
    roomsLayer.add(roomGraphic);
  }

  backgroundLayer.add(new Konva.Rect({
    x: 0,
    y: 0,
    width: grid.width,
    height: grid.height,
    fill: 'white'
  }));

  stage.add(backgroundLayer, gridLayer, roomsLayer, corridorLayer);
});

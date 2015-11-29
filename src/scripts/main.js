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
    let x = randomInt(1, (grid.width - width - grid.size) / grid.size - 1) * grid.size - (grid.size / 2) + 0.5;
    let y = randomInt(1, (grid.height - height - grid.size) / grid.size - 1) * grid.size - (grid.size / 2) + 0.5;

    return {
      id: id,
      width: width,
      height: height,
      x: x,
      y: y
    }

    function randomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    }
  }

  let rooms = [];
  let roomLimit = 100;
  let i;
  for (i = 0; i < 1000; i++) {
    let room = generateRoom(i, 6, 12);

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
        rect.x                - (grid.size * 2) < existingRoom.x + existingRoom.width   &&
        rect.x + rect.width   + (grid.size * 2) > existingRoom.x                        &&
        rect.y                - (grid.size * 2) < existingRoom.y + existingRoom.height  &&
        rect.y + rect.height  + (grid.size * 2) > existingRoom.y
      ) {
        return true;
      }
    }

    return false;
  }

  for (let room of rooms) {
    let roomGraphic = new Konva.Rect({
      x: room.x,
      y: room.y,
      width: room.width,
      height: room.height,
      strokeWidth: grid.size,
      stroke: 'rgba(50, 90, 120, 0.75)'
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

  stage.add(backgroundLayer, gridLayer, roomsLayer);
});

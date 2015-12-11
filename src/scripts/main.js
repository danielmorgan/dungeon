import Konva from 'konva';

window.addEventListener('load', function() {

  // stage and grid
  const grid = {
    size: 50,
    padding: 1,
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





  // build rooms
  let rooms = [];
  let roomLimit = 100;
  let i;
  for (i = 0; i < 1000; i++) {
    let room = generateRoom(i, 4, 6);

    if (! collidesWithExistingRooms(room)) {
      rooms.push(room);
    }

    if (rooms.length >= roomLimit) {
      break;
    }
  }
  console.log('Generated', rooms.length, 'rooms in', i, 'attempts');

  function generateRoom(id, minLength, maxLength) {
    return {
      id: id,
      width: (randomInt(minLength, maxLength) + 1) * grid.size,
      height: (randomInt(minLength, maxLength) + 1) * grid.size,
      x: randomPos(grid.width, maxLength, 3) + 0.5,
      y: randomPos(grid.height, maxLength, 3) + 0.5
    }
  }

  function randomPos(axisLength, maxLengthOfRoom) {
    let maxLengthOfRoomInPixels = maxLengthOfRoom * grid.size;
    let distanceFromStartEdge = grid.padding * grid.size;
    let distanceFromEndEdge = axisLength - (maxLengthOfRoom * grid.size) - ((grid.padding + 1) * grid.size);
    let pos = randomInt(distanceFromStartEdge, distanceFromEndEdge);
    return Math.round(pos / grid.size) * grid.size;
  }

  function collidesWithExistingRooms(rect) {
    for (let existingRoom of rooms) {
      if (
        rect.x                - (grid.size * grid.padding) < existingRoom.x + existingRoom.width   &&
        rect.x + rect.width   + (grid.size * grid.padding) > existingRoom.x                        &&
        rect.y                - (grid.size * grid.padding) < existingRoom.y + existingRoom.height  &&
        rect.y + rect.height  + (grid.size * grid.padding) > existingRoom.y
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

  function random(arr) {
    return arr[randomInt(0, arr.length - 1)];
  }


  // draw rooms
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

  let directions = [
    { name: 'north', x: 0, y: -1, checked: false },
    { name: 'east ', x: 1, y: 0, checked: false },
    { name: 'south', x: 0, y: 1, checked: false },
    { name: 'west ', x: -1, y: 0, checked: false }
  ];

  // hunt-and-kill algorithm
  let k = 0;
  drawCorridor();
  function drawCorridor(node = false) {
    k = k + 1;
    if (! node) node = random(graph);
    console.log('         start = ' + node.x + ',' + node.y);
    let nextNode = move(node);
    node.visited = true;
    if (k < 20) {
      drawCorridor(nextNode);
    }

    function move(from, directionIndex = 0) {
      let direction = random(directions);
      direction.checked = true;

      var nextNode = graph.filter(node =>
        node.x === from.x + direction.x &&
        node.y === from.y + direction.y)[0];

      console.log(from.x + ',' + from.y, '+ [' + direction.name + ']', '=', nextNode.x + ',' + nextNode.y);

      if (graph.every(n => n.visited)) {
        console.log('all done');
        return;
      }

      // tried to turn into a visited node
      else if (nextNode.visited) {
        console.log('already visited');
        move(from);
      }

      // reached end of the graph
      else if (typeof nextNode === 'undefined') {
        console.log('end of graph');
        move(from);
      }

      // tried to turn every direction
      else if (allDirectionsChecked()) {
        directions.map(d => d.checked = false); // reset checked status
        drawCorridor();
      }

      else {
        directions.map(d => d.checked = false); // reset checked status
        move(nextNode);
      }



      function allDirectionsChecked() {
        return directions.map(d => d.checked).every(d => d);
      }
    }
  }




  // draw corridors
  for (let node of graph.filter(n => n.visited)) {
    corridorLayer.add(new Konva.Rect({
      x: node.x * grid.size + 1,
      y: node.y * grid.size + 1,
      width: grid.size - 1,
      height: grid.size - 1,
      fill: 'red'
    }));
  }



  backgroundLayer.add(new Konva.Rect({
    x: 0,
    y: 0,
    width: grid.width,
    height: grid.height,
    fill: 'white'
  }));

  stage.add(backgroundLayer, gridLayer, corridorLayer);
});

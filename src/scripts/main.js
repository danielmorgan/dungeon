import Konva from 'konva';

window.addEventListener('load', function() {
  let stage = new Konva.Stage({
    container: 'game',
    width: 800,
    height: 600
  });

  let layer = new Konva.Layer();

  let background = new Konva.Rect({
    x: 0,
    y: 0,
    width: stage.getWidth(),
    height: stage.getHeight(),
    fill: 'white'
  });

  layer.add(background);
  stage.add(layer);
});

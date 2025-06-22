AFRAME.registerComponent('planet', {
  schema: {
    name: { type: 'string' },
    dist: { type: 'number' },
    speed: { type: 'number' }
  },

  init: function () {
    this.angle = Math.random() * Math.PI * 2;
    this.el.setAttribute('position', {
      x: this.data.dist,
      y: 0,
      z: 0
    });
  },

  tick: function (time, timeDelta) {
    this.angle += this.data.speed;
    let x = this.data.dist * Math.cos(this.angle);
    let z = this.data.dist * Math.sin(this.angle);
    this.el.setAttribute('position', { x: x, y: 0, z: z });
  }
});

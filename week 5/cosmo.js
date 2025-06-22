
const G = 6.67430e-11;
const SUN_MASS = 1.989e30;
const planets = [];

AFRAME.registerComponent('planet', {
  schema: {
    name: {type: 'string'},
    mass: {type: 'number'},
    year: {type: 'number'},
    dist: {type: 'number'}
  },
  init: function() {
    this.el.setAttribute('position', {
      x: this.data.dist / 1e9,
      y: 0,
      z: 0
    });
    this.v = [0, Math.sqrt(G * SUN_MASS / this.data.dist), 0];
    planets.push({
      el: this.el,
      name: this.data.name,
      mass: this.data.mass,
      year: this.data.year,
      dist: this.data.dist,
      pos: [this.data.dist, 0, 0],
      v: this.v,
      a: [0, 0, 0]
    });
  },
  tick: function(time, timeDelta) {
    const dt = 86400 / 3;
    for (let i = 0; i < planets.length; i++) {
      planets[i].a = [0, 0, 0];
      for (let j = 0; j < planets.length; j++) {
        if (i !== j) {
          let r = [
            planets[j].pos[0] - planets[i].pos[0],
            planets[j].pos[1] - planets[i].pos[1],
            planets[j].pos[2] - planets[i].pos[2]
          ];
          let dist = Math.sqrt(r[0]*r[0] + r[1]*r[1] + r[2]*r[2]);
          for (let k = 0; k < 3; k++) {
            planets[i].a[k] += G * planets[j].mass * r[k] / Math.pow(dist, 3);
          }
        }
      }
    }
    for (let i = 0; i < planets.length; i++) {
      for (let k = 0; k < 3; k++) {
        planets[i].v[k] += planets[i].a[k] * dt;
        planets[i].pos[k] += planets[i].v[k] * dt;
      }
      planets[i].el.setAttribute('position', {
        x: planets[i].pos[0] / 1e9,
        y: planets[i].pos[1] / 1e9,
        z: planets[i].pos[2] / 1e9
      });
    }
  }
});

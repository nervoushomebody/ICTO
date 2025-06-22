const day = 24.0*60*60;

AFRAME.registerComponent('planet', {
 	schema: {
 		name: {type: 'string', default: ""},
 		dist: {type: 'number', default: 0},
 		mass: {type: 'number', default: 0},
 		T: {type: 'int', default: 0},
 		v: {type: 'array', default: [0,0,0]},
 		a: {type: 'array', default: [0,0,0]},
 		pos: {type: 'array', default: [0,0,0]}
 	},

	init: function () {
 		this.data.T*=day;
 		this.data.pos[0]=this.data.dist;
 		this.el.setAttribute('position', this.data.dist/1e9+' 0 0');
 		if(this.data.T!=0)
 		this.data.v[1] = 2*Math.PI*this.data.dist/this.data.T;
 		}
});

AFRAME.registerComponent('main', {
 	init: function() {
 		this.solar_system = document.querySelectorAll('[planet]');
 	},

 	tick: function (time, deltaTime) {
 		const dt = day/3;
 		const G=6.67e-11;

 		for(var i = 0; i<this.solar_system.length; i++) {
 			planet_i=this.solar_system[i].getAttribute('planet');
 			planet_i.a[0]=planet_i.a[1]=planet_i.a[2]=0;
 			
			for(var j = 0; j<this.solar_system.length; j++) {
 				planet_j=this.solar_system[j].getAttribute('planet');
 				if(i!=j) {
 					deltapos = [0,0,0];
 					for(var k = 0; k < 3; k++)
 						deltapos[k]=planet_j.pos[k]-planet_i.pos[k];
 						var r=Math.sqrt(Math.pow(deltapos[0],2) + Math.pow(deltapos[1],2)+Math.pow(deltapos[2],2));
 						for(var k = 0; k < 3; k++)
 							planet_i.a[k]+=G*planet_j.mass*deltapos[k]/Math.pow(r, 3);
 				}
 			}
 			for(var k = 0; k < 3; k++)
 				planet_i.v[k]+=planet_i.a[k]*dt;
 			for(var k = 0; k < 3; k++)
 				planet_i.pos[k]+=planet_i.v[k]*dt;
 			this.solar_system[i].setAttribute('position',(planet_i.pos[0]/1e9)+' '+(planet_i.pos[1]/1e9)+' '+(planet_i.pos[2]/1e9));
 		}
 	}
});
tick: function(time, timeDelta) {
  // Крок інтегрування (1/3 земного дня)
  const dt = 86400 / 3;
  
  // Розрахунок прискорення для всіх планет
  for (let i = 0; i < planets.length; i++) {
    planets[i].a = [0, 0, 0];
    
    for (let j = 0; j < planets.length; j++) {
      if (i !== j) {
        // Вектор відстані між планетами
        let r = [
          planets[j].pos[0] - planets[i].pos[0],
          planets[j].pos[1] - planets[i].pos[1],
          planets[j].pos[2] - planets[i].pos[2]
        ];
        
        // Модуль відстані
        let dist = Math.sqrt(r[0]*r[0] + r[1]*r[1] + r[2]*r[2]);
        
        // Розрахунок прискорення за законом Ньютона
        for (let k = 0; k < 3; k++) {
          planets[i].a[k] += G * planets[j].mass * r[k] / Math.pow(dist, 3);
        }
      }
    }
  }
  
  // Оновлення швидкості та координат
  for (let i = 0; i < planets.length; i++) {
    for (let k = 0; k < 3; k++) {
      planets[i].v[k] += planets[i].a[k] * dt;
      planets[i].pos[k] += planets[i].v[k] * dt;
    }
    
    // Оновлення позиції 3D-об'єкта
    planets[i].el.setAttribute('position', {
      x: planets[i].pos[0] / 1000000000,
      y: planets[i].pos[1] / 1000000000,
      z: planets[i].pos[2] / 1000000000
    });
  }
}

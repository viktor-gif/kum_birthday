const contentWrap = document.querySelector('#contentWrap')
const body = document.querySelector('body')

new Promise((resolve, reject) => {
    const askText = document.querySelector('#askText')
    setTimeout(() => {
        askText.remove()
        resolve()
    }, 3000)
})
.then(() => {
    return new Promise((resolve, reject) => {
        let video = document.createElement('video')
        video.src = "video/birthday.mp4"
        video.autoplay = true
        video.muted = true
        video.controls = true
        video.volume = 0.0

        let intervalId = setInterval(() => {
            console.log(video.volume)
            video.volume += 0.05;
        }, 1000)
        console.log(+video.volume)

        setTimeout(() => {
            clearInterval(intervalId)
        }, 18000)

        contentWrap.append(video)

        setInterval(() => {
            if (video.currentTime > 22) {
                contentWrap.remove()
                resolve()
            }
        }, 1000)
        
    })
})
.then(() => {

    const congratulation = document.createElement('div')
    congratulation.className = "congratulation"
    congratulation.innerText = "Любий куме, вітаємо тебе з днем народження!!!"

    const kumPic = document.createElement('img')
    kumPic.src = "img/kum.png"
    kumPic.alt = "Найкращий кум"
    kumPic.style.position = "absolute"
    kumPic.style.top = "0"
    kumPic.style.left = "0"
    kumPic.style.zIndex = "1000"
    kumPic.style.width = "100%"
    kumPic.style.opacity = "0.3"

    body.prepend(congratulation)
    body.prepend(kumPic)

    // canvas
    const rndColor = () => {
        const base  = Math.random() * 360 | 0;
        const color = (275 * (base / 200 | 0)) + base % 200;
        return fac => `hsl(${color}, ${(fac || 1) * 100}%, ${(fac || 1) * 60}%)`;
    };
    
    class Battery
    {
        constructor(fireworks) {
            this.fireworks = fireworks;
            this.salve = [];
            this.x     = Math.random();
            this.t     = 0;
            this.tmod  = 20 + Math.random() * 20 | 0;
            this.tmax  = 500 + Math.random() * 1000;
    
            this._shot = salve => {
                // console.log(this.x * this.fireworks.width, salve.y);
                if (salve.y < salve.ym) {
                    salve.cb = this._prepareExplosion;
                }
    
                salve.x += salve.mx;
                salve.y -= 0.01;
    
                const r = Math.atan2(-0.01, salve.mx);
    
                this.fireworks.engine.strokeStyle = salve.c(.7);
                this.fireworks.engine.beginPath();
    
                this.fireworks.engine.moveTo(
                    (this.x + salve.x) * this.fireworks.width + Math.cos(r) * 4,
                    salve.y * this.fireworks.height + Math.sin(r) * 4
                );
    
                this.fireworks.engine.lineTo(
                    (this.x + salve.x) * this.fireworks.width + Math.cos(r + Math.PI) * 4,
                    salve.y * this.fireworks.height + Math.sin(r + Math.PI) * 4
                );
    
                this.fireworks.engine.lineWidth = 3;
                this.fireworks.engine.stroke();
    
                // this.fireworks.engine.fillRect((this.x + salve.x) * this.fireworks.width, salve.y * this.fireworks.height, 10, 10);
            };
    
            this._prepareExplosion = salve => {
                salve.explosion = [];
    
                for (let i = 0, max = 15; i < max; i++) {
                    salve.explosion.push({
                        r : 2 * i / Math.PI,
                        s : 0.5 + Math.random() * 0.5,
                        d : 0,
                        y : 0
                    });
                }
    
                salve.cb = this._explode;
            };
    
            this._explode = salve => {
    
                this.fireworks.engine.fillStyle = salve.c();
    
                salve.explosion.forEach(explo => {
    
                    explo.d += explo.s;
                    explo.s *= 0.99;
                    explo.y += 0.5;
    
                    const alpha = explo.s * 2.5;
                    this.fireworks.engine.globalAlpha = alpha;
    
                    if (alpha < 0.05) {
                        salve.cb = null;
                    }
    
                    this.fireworks.engine.fillRect(
                        Math.cos(explo.r) * explo.d + (this.x + salve.x) * this.fireworks.width,
                        Math.sin(explo.r) * explo.d + explo.y + salve.y * this.fireworks.height,
                        3,
                        3
                    );
                });
    
                this.fireworks.engine.globalAlpha = 1;
            }
        }
    
        pushSalve() {
            this.salve.push({
                x: 0,
                mx: -0.02 * Math.random() * 0.04,
                y: 1,
                ym: 0.05 + Math.random() * 0.5,
                c: rndColor(),
                cb: this._shot
            });
        };
    
        render() {
    
            this.t++;
    
            if (this.t < this.tmax && (this.t % this.tmod) === 0) {
                this.pushSalve();
            }
    
            let rendered = false;
    
            this.salve.forEach(salve => {
    
                if (salve.cb) {
                    rendered = true;
                    salve.cb(salve);
                }
    
            });
    
            if (this.t > this.tmax) {
                return rendered;
            }
    
            return true;
        }
    }
    
    class Fireworks
    {
        constructor() {
            this.canvas = window.document.querySelector('canvas');
            this.engine = this.canvas.getContext('2d');
            this.stacks = new Map();
    
            this.resize();
        }
    
        resize() {
            this.width  = window.innerWidth;
            this.height = window.innerHeight;
    
            this.canvas.setAttribute('width', this.width);
            this.canvas.setAttribute('height', this.height);
        }
    
        clear() {
            this.engine.clearRect(0, 0, this.width, this.height);
            this.engine.fillStyle = '#222';
            this.engine.fillRect(0, 0, this.width, this.height);
        }
    
        addBattery() {
          const bat = new Battery(this);
          this.stacks.set(Date.now(), bat);  
        }
      
        render() {
    
            if (Math.random() < 0.05) {
              this.addBattery();
            }
          
            this.clear();
    
            this.stacks.forEach((scene, key) => {
    
                const rendered = scene.render();
    
                if (!rendered) {
                    this.stacks.delete(key);
                }
            });
    
            requestAnimationFrame(this.render.bind(this));
        }
    
        run() {
            for(let i = 0; i < 5; i++) {
              this.addBattery();
            }
            window.addEventListener('resize', this.resize.bind(this));
            this.render();
        }
    }
    
    a = new Fireworks();
    a.run();
})







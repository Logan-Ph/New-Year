$(function() {
	var canvas = $("#confetti")[0];
	canvas.width = $(window).width();
	canvas.height = $(window).height();
	var ctx = canvas.getContext("2d");

	// resize
	$(window).on("resize", function() {
		canvas.width = $(window).width();
		canvas.height = $(window).height();
		ctx.fillStyle = "#000";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	});

	// init
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// objects
	var listFire = [];
	var listFirework = [];
	var fireNumber = 13; // Number of initial fire particles
	var center = { x: canvas.width / 2, y: canvas.height / 2 };
	var range = 900; // Range for spread

	for (var i = 0; i < fireNumber; i++) {
		var fire = {
			x: Math.random() * range / 2 - range / 4 + center.x,
			y: Math.random() * range * 2 + canvas.height,
			size: Math.random() + 0.5,
			fill: "#fd1",
			vx: Math.random() - 0.5,
			vy: -(Math.random() + 4),
			ax: Math.random() * 0.02 - 0.01,
			far: Math.random() * range + (center.y - range)
		};
		fire.base = {
			x: fire.x,
			y: fire.y,
			vx: fire.vx
		};
		listFire.push(fire);
	}

	function randColor() {
		var r = Math.floor(Math.random() * 256);
		var g = Math.floor(Math.random() * 256);
		var b = Math.floor(Math.random() * 256);
		return `rgb(${r}, ${g}, ${b})`;
	}

	// Function to create fireworks in specific shapes or patterns
	function createPatternFireworks(x, y, pattern) {
		var color = randColor();
		var explosionSize = 120; // Number of fireworks per explosion
		var lingerTime = 12; // Time (in frames) the fireworks stay in place before falling

		for (var i = 0; i < explosionSize; i++) {
			var angle = i / explosionSize * Math.PI * 2; // Distribute fireworks in a circle
			var radius = Math.random() * 20 + 100; // Random radius for spread

			// Customize patterns
			switch (pattern) {
				case "circle":
					var firework = {
						x: x + Math.cos(angle) * radius,
						y: y + Math.sin(angle) * radius,
						size: Math.random() + 2.5,
						fill: color,
						vx: Math.cos(angle) * 2,
						vy: Math.sin(angle) * 2, // Reduced vertical velocity for slower fall
						ay: 0.001, // Reduced gravity effect
						alpha: 1,
						life: Math.round(Math.random() * range / 2) + range / 2,
						linger: lingerTime // Time to linger before falling
					};
					break;
				case "heart":
					var t = i / explosionSize * Math.PI * 2;
					var heartX = 16 * Math.pow(Math.sin(t), 3);
					var heartY = -(
						13 * Math.cos(t) -
						5 * Math.cos(2 * t) -
						2 * Math.cos(3 * t) -
						Math.cos(4 * t)
					);
					var firework = {
						x: x + heartX * 10,
						y: y + heartY * 10,
						size: Math.random() + 2.5,
						fill: color,
						vx: Math.random() * 2 - 1,
						vy: Math.random() * 2 - 1, // Reduced vertical velocity for slower fall
						ay: 0.001, // Reduced gravity effect
						alpha: 1,
						life: Math.round(Math.random() * 10 + 1000),
						linger: lingerTime // Time to linger before falling
					};
					break;
				case "spiral":
					var spiralAngle = (i / explosionSize) * Math.PI * 4; // Spiral angle
					var spiralRadius = (i / explosionSize) * radius; // Increasing radius for spiral
					var firework = {
						x: x + Math.cos(spiralAngle) * spiralRadius,
						y: y + Math.sin(spiralAngle) * spiralRadius,
						size: Math.random() + 2.5,
						fill: color,
						vx: Math.cos(spiralAngle) * 2,
						vy: Math.sin(spiralAngle) * 2, // Reduced vertical velocity for slower fall
						ay: 0.001, // Reduced gravity effect
						alpha: 1,
						life: Math.round(Math.random() * range / 2) + range / 2,
					};
					break;
				default:
					var firework = {
						x: x + Math.random() * 100 - 50,
						y: y + Math.random() * 100 - 50,
						size: Math.random() + 2.5,
						fill: color,
						vx: Math.random() * 10 - 5,
						vy: Math.random() * 10 - 5, // Reduced vertical velocity for slower fall
						ay: 0.001, // Reduced gravity effect
						alpha: 2,
						life: Math.round(Math.random() * range / 2) + range / 2,
					};
			}
			firework.base = {
				life: firework.life,
				size: firework.size
			};
			listFirework.push(firework);
		}
	}

	(function loop() {
		requestAnimationFrame(loop);
		update();
		draw();
	})();

	function update() {
		for (var i = 0; i < listFire.length; i++) {
			var fire = listFire[i];
			if (fire.y <= fire.far) {
				// Create fireworks in different patterns
				var patterns = ["circle", "heart", "spiral", "default"];
				var pattern =
					patterns[Math.floor(Math.random() * patterns.length)];
				createPatternFireworks(fire.x, fire.y, pattern);

				// Reset fire position
				fire.y = fire.base.y;
				fire.x = fire.base.x;
				fire.vx = fire.base.vx;
				fire.ax = Math.random() * 0.02 - 0.01;
			}
			fire.x += fire.vx;
			fire.y += fire.vy;
			fire.vx += fire.ax;
		}

		for (var i = listFirework.length - 1; i >= 0; i--) {
			var firework = listFirework[i];
			if (firework) {
				if (firework.linger > 0) {
					// Firework is lingering
					firework.linger--;
				} else {
					// Firework starts falling apart
					firework.x += firework.vx;
					firework.y += firework.vy;
					firework.vy += firework.ay; // Apply gravity
					firework.alpha = firework.life / firework.base.life; // Decay alpha
					firework.size = firework.alpha * firework.base.size; // Decay size
					firework.life--;
					if (firework.life <= 0) {
						listFirework.splice(i, 1); // Remove expired fireworks
					}
				}
			}
		}
	}

	function draw() {
		// clear
		ctx.globalCompositeOperation = "source-over";
		ctx.globalAlpha = 0.18;
		ctx.fillStyle = "#000";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// re-draw
		ctx.globalCompositeOperation = "screen";
		ctx.globalAlpha = 1;
		for (var i = 0; i < listFire.length; i++) {
			var fire = listFire[i];
			ctx.beginPath();
			ctx.arc(fire.x, fire.y, fire.size, 0, Math.PI * 2);
			ctx.closePath();
			ctx.fillStyle = fire.fill;
			ctx.fill();
		}

		for (var i = 0; i < listFirework.length; i++) {
			var firework = listFirework[i];
			ctx.globalAlpha = firework.alpha; // Apply decayed alpha
			ctx.beginPath();
			ctx.arc(firework.x, firework.y, firework.size, 0, Math.PI * 2);
			ctx.closePath();
			ctx.fillStyle = firework.fill;
			ctx.fill();
		}
	}
});
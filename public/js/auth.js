// Page 1: Auth Vortex & Immersive 3D Hero Scene Controller
document.addEventListener('DOMContentLoaded', () => {
  const authCard = document.getElementById('auth-card');
  const authForm = document.getElementById('auth-form');
  const alertBox = document.getElementById('alert-box');
  const nameFieldGroup = document.getElementById('name-field-group');
  const regNameInput = document.getElementById('reg-name');
  const emailInput = document.getElementById('auth-email');
  const passwordInput = document.getElementById('auth-password');
  const submitBtn = document.getElementById('submit-btn');
  const toggleAuthMode = document.getElementById('toggle-auth-mode');
  const toggleText = document.getElementById('toggle-text');
  const guestBtn = document.getElementById('guest-btn');

  let isLoginMode = true;

  // ==========================================
  // 1. ACTIVE CURSOR 3D CARD TILT
  // ==========================================
  if (authCard) {
    window.pf3D.applyTilt(authCard, 10);
  }

  // ==========================================
  // 2. THREE.JS 3D HERO WORLD CREATOR
  // ==========================================
  init3DHeroScene();

  function init3DHeroScene() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    // Create Scene, Camera, and Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.5, 6);

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Optimized screen fill

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambientLight);

    const mainLight = new THREE.PointLight(0xffffff, 1.2, 30);
    mainLight.position.set(0, 4, 3);
    scene.add(mainLight);

    // Colored spot lights to wash the 3D meshes with nice tones
    const indigoLight = new THREE.DirectionalLight(0x6366f1, 0.85);
    indigoLight.position.set(-3, 2, -2);
    scene.add(indigoLight);

    const cyanLight = new THREE.DirectionalLight(0x06b2d2, 0.65);
    cyanLight.position.set(3, -1, 2);
    scene.add(cyanLight);

    // ------------------------------------------
    // A. STYLIZED THINKING BOY & NEURAL BRAIN CHARACTER (ROTATES 360 DEGREES)
    // ------------------------------------------
    const characterGroup = new THREE.Group();
    characterGroup.position.set(-1.7, -0.6, 0.5); // Positioned left of the screen, next to the hero text
    scene.add(characterGroup);

    // 1. Core Group for the Boy Mesh
    const boyGroup = new THREE.Group();
    characterGroup.add(boyGroup);

    const headMat = new THREE.MeshStandardMaterial({
      color: 0xfecdd3, // Flesh pink skin
      roughness: 0.6
    });

    // Torso (Shirt)
    const torsoGeo = new THREE.CylinderGeometry(0.24, 0.18, 0.6, 12);
    const torsoMat = new THREE.MeshStandardMaterial({
      color: 0x4f46e5, // Indigo shirt
      roughness: 0.5,
      metalness: 0.1
    });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 0.3;
    boyGroup.add(torso);

    // Head
    const headGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 0.72;
    boyGroup.add(head);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.1, 8);
    const neck = new THREE.Mesh(neckGeo, headMat);
    neck.position.y = 0.6;
    boyGroup.add(neck);

    // Hair
    const hairGroup = new THREE.Group();
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 }); // Slate-dark hair
    
    // Top hair box
    const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.1, 0.24), hairMat);
    hairTop.position.set(0, 0.85, 0);
    hairGroup.add(hairTop);
    
    // Side hair blocks
    const hairLeft = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.18, 0.24), hairMat);
    hairLeft.position.set(-0.11, 0.78, 0.02);
    hairGroup.add(hairLeft);

    const hairRight = hairLeft.clone();
    hairRight.position.x = 0.11;
    hairGroup.add(hairRight);

    // Front fringe
    const hairFront = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.06), hairMat);
    hairFront.position.set(0, 0.81, 0.1);
    hairGroup.add(hairFront);

    boyGroup.add(hairGroup);

    // Crossed Legs (sitting cross-legged pose on the floor)
    const legMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 }); // Grey trousers
    const legGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.45, 8);
    
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.rotation.z = Math.PI / 2.2;
    leftLeg.rotation.y = -Math.PI / 6;
    leftLeg.position.set(-0.18, 0.06, 0.1);
    boyGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.rotation.z = -Math.PI / 2.2;
    rightLeg.rotation.y = Math.PI / 6;
    rightLeg.position.set(0.18, 0.06, 0.1);
    boyGroup.add(rightLeg);

    // Left Arm (Relaxed)
    const armMat = new THREE.MeshStandardMaterial({ color: 0x4f46e5, roughness: 0.5 }); // Indigo sleeve
    const armGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.35, 8);
    const forearmGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.3, 8);

    const leftArmUpper = new THREE.Mesh(armGeo, armMat);
    leftArmUpper.rotation.z = Math.PI / 6;
    leftArmUpper.position.set(-0.28, 0.45, 0);
    boyGroup.add(leftArmUpper);

    const leftForearm = new THREE.Mesh(forearmGeo, armMat);
    leftForearm.rotation.x = Math.PI / 4;
    leftForearm.position.set(-0.31, 0.3, 0.1);
    boyGroup.add(leftForearm);

    // Right Arm (Thinking pose - hand touching chin)
    const rightArmUpper = new THREE.Mesh(armGeo, armMat);
    rightArmUpper.rotation.z = -Math.PI / 5;
    rightArmUpper.rotation.y = -Math.PI / 4;
    rightArmUpper.position.set(0.24, 0.42, 0.08);
    boyGroup.add(rightArmUpper);

    const rightForearm = new THREE.Mesh(forearmGeo, armMat);
    rightForearm.rotation.x = -Math.PI / 2.5; // Angled upwards towards chin
    rightForearm.rotation.y = -Math.PI / 6;
    rightForearm.position.set(0.2, 0.52, 0.22);
    boyGroup.add(rightForearm);

    // Hand touching chin
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), headMat);
    hand.position.set(0.1, 0.65, 0.18); // Positioned near chin
    boyGroup.add(hand);

    // 2. Rotating 3D Neural Brain Group (Positioned above the boy's head)
    const brainGroup = new THREE.Group();
    brainGroup.position.set(0, 1.25, 0);
    brainGroup.scale.set(0.55, 0.55, 0.55);
    characterGroup.add(brainGroup);

    // Brain wireframe outline shell
    const brainShell = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 12, 12),
      new THREE.MeshBasicMaterial({
        color: 0x4f46e5,
        wireframe: true,
        transparent: true,
        opacity: 0.3
      })
    );
    brainGroup.add(brainShell);

    // Left hemisphere node clusters
    const leftGlobe = new THREE.Mesh(
      new THREE.SphereGeometry(0.38, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x06b2d2, wireframe: true, transparent: true, opacity: 0.45 })
    );
    leftGlobe.position.x = -0.18;
    brainGroup.add(leftGlobe);

    // Right hemisphere node clusters
    const rightGlobe = leftGlobe.clone();
    rightGlobe.position.x = 0.18;
    brainGroup.add(rightGlobe);

    // 3. Orbiting Mathematical Formulas Sprites Group
    const mathSymbols = ['√', 'π', 'Σ', 'x', '÷', '+', 'y=mx', 'a²+b²=c²'];
    
    function createMathSymbolTexture(symbol) {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, 128, 128);
      ctx.font = 'bold 44px "Poppins", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(symbol, 64, 64);
      return new THREE.CanvasTexture(canvas);
    }

    const symbolGroup = new THREE.Group();
    symbolGroup.position.set(0, 1.25, 0); // Center around the brain
    characterGroup.add(symbolGroup);

    const symbolSprites = [];
    const symbolRadii = [];
    const symbolAngles = [];
    const symbolSpeeds = [];
    const symbolYOffsets = [];

    mathSymbols.forEach((sym, idx) => {
      const texture = createMathSymbolTexture(sym);
      const mat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        color: new THREE.Color().setHSL(idx / mathSymbols.length, 0.95, 0.6)
      });
      const sprite = new THREE.Sprite(mat);
      
      const size = 0.28 + Math.random() * 0.12;
      sprite.scale.set(size, size, 1);
      
      symbolGroup.add(sprite);
      symbolSprites.push(sprite);
      
      symbolRadii.push(0.55 + Math.random() * 0.4);
      symbolAngles.push((idx / mathSymbols.length) * Math.PI * 2);
      symbolSpeeds.push(0.012 + Math.random() * 0.01);
      symbolYOffsets.push((Math.random() - 0.5) * 0.3);
    });

    // ------------------------------------------
    // D. FLOATING ACADEMIC & TECHNICAL ENTITIES (GRADUATION CAPS, BOOKS, GEARS & SCROLLS)
    // ------------------------------------------
    const books = [];
    const caps = [];
    const gears = [];
    const scrolls = [];

    // Spawn 4 floating books
    const bookColors = [0xef4444, 0x10b981, 0x06b2d2, 0xf59e0b];
    for (let i = 0; i < 4; i++) {
      const book = new THREE.Group();
      
      const cover = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.04, 0.3),
        new THREE.MeshStandardMaterial({ color: bookColors[i], roughness: 0.4 })
      );
      book.add(cover);

      const pages = new THREE.Mesh(
        new THREE.BoxGeometry(0.225, 0.03, 0.285),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 })
      );
      pages.position.x = 0.008;
      book.add(pages);

      // Position scattered around space
      book.position.set(
        (Math.random() - 0.5) * 3.5,
        0.3 + Math.random() * 1.5,
        (Math.random() - 0.5) * 2.5
      );
      scene.add(book);
      books.push(book);
    }

    // Spawn 3 floating graduation caps
    for (let i = 0; i < 3; i++) {
      const cap = new THREE.Group();
      
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.08, 12),
        new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.8 })
      );
      cap.add(base);

      const board = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.012, 0.28),
        new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.8 })
      );
      board.position.y = 0.045;
      cap.add(board);

      cap.position.set(
        (Math.random() - 0.5) * 3.5,
        0.5 + Math.random() * 1.5,
        (Math.random() - 0.5) * 2.5
      );
      scene.add(cap);
      caps.push(cap);
    }

    // Spawn 3 floating cogs/gears (for engineering/polytechnic theme)
    for (let i = 0; i < 3; i++) {
      const gear = new THREE.Group();
      const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.13, 0.05, 8),
        new THREE.MeshStandardMaterial({ color: 0x06b2d2, metalness: 0.8, roughness: 0.2 })
      );
      gear.add(hub);
      
      // Add teeth
      for (let j = 0; j < 6; j++) {
        const tooth = new THREE.Mesh(
          new THREE.BoxGeometry(0.05, 0.03, 0.32),
          new THREE.MeshStandardMaterial({ color: 0x0891b2, metalness: 0.8, roughness: 0.2 })
        );
        tooth.rotation.y = (j / 6) * Math.PI * 2;
        gear.add(tooth);
      }
      
      gear.position.set(
        (Math.random() - 0.5) * 3.5,
        0.4 + Math.random() * 1.5,
        (Math.random() - 0.5) * 2.5
      );
      scene.add(gear);
      gears.push(gear);
    }

    // Spawn 3 floating diploma scrolls
    for (let i = 0; i < 3; i++) {
      const scroll = new THREE.Group();
      // Roll
      const paper = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.24, 8),
        new THREE.MeshStandardMaterial({ color: 0xfafaf9, roughness: 0.6 })
      );
      paper.rotation.z = Math.PI / 2;
      scroll.add(paper);
      // Tie Ribbon
      const ribbon = new THREE.Mesh(
        new THREE.CylinderGeometry(0.033, 0.033, 0.04, 8),
        new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 })
      );
      ribbon.rotation.z = Math.PI / 2;
      scroll.add(ribbon);

      scroll.position.set(
        (Math.random() - 0.5) * 3.5,
        0.4 + Math.random() * 1.5,
        (Math.random() - 0.5) * 2.5
      );
      scene.add(scroll);
      scrolls.push(scroll);
    }

    // ------------------------------------------
    // E. GLOWING SPACE DUST (Particles)
    // ------------------------------------------
    const starCount = 300;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const palette = [new THREE.Color('#4f46e5'), new THREE.Color('#06b2d2'), new THREE.Color('#10b981')];

    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 12;
      starPos[i + 1] = (Math.random() - 0.5) * 12;
      starPos[i + 2] = (Math.random() - 0.5) * 8;

      const clr = palette[Math.floor(Math.random() * palette.length)];
      starColors[i] = clr.r;
      starColors[i + 1] = clr.g;
      starColors[i + 2] = clr.b;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.06,
      transparent: true,
      blending: THREE.NormalBlending,
      vertexColors: true,
      depthWrite: false
    });
    const starSystem = new THREE.Points(starGeo, starMaterial);
    scene.add(starSystem);

    // ------------------------------------------
    // F. ANIMATION & SMOOTH CAMERA ORBIT LOOP
    // ------------------------------------------
    const clock = new THREE.Clock();

    function animateHeroScene() {
      requestAnimationFrame(animateHeroScene);

      const time = clock.getElapsedTime();

      // Rotate entire boy + brain + symbols group 360 degrees
      characterGroup.rotation.y = time * 0.25;

      // Brain breathing pulse scale
      brainGroup.rotation.y = time * 0.16;
      brainGroup.rotation.z = Math.sin(time * 0.15) * 0.1;
      const bScale = 1.0 + Math.sin(time * 1.8) * 0.06;
      brainGroup.scale.setScalar(bScale * 0.55);

      // Orbiting math symbols
      symbolSprites.forEach((sprite, idx) => {
        symbolAngles[idx] += symbolSpeeds[idx];
        const angle = symbolAngles[idx];
        const rad = symbolRadii[idx];
        sprite.position.x = Math.cos(angle) * rad;
        sprite.position.z = Math.sin(angle) * rad;
        sprite.position.y = symbolYOffsets[idx] + Math.sin(time * 1.5 + idx) * 0.06;
      });

      // Floating books
      books.forEach((book, idx) => {
        book.position.y += Math.sin(time * 1.2 + idx * 2.0) * 0.0022;
        book.rotation.x = time * 0.15 + idx;
        book.rotation.y = time * 0.08 + idx * 0.4;
      });

      // Floating graduation caps
      caps.forEach((cap, idx) => {
        cap.position.y += Math.sin(time * 1.0 + idx * 1.8) * 0.0022;
        cap.rotation.y = time * 0.1 + idx;
        cap.rotation.z = Math.sin(time * 0.4 + idx) * 0.08;
      });

      // Floating gears/cogs rotation
      gears.forEach((gear, idx) => {
        gear.position.y += Math.sin(time * 0.8 + idx * 2.2) * 0.0018;
        gear.rotation.y += 0.015 * (idx % 2 === 0 ? 1 : -1);
        gear.rotation.x = time * 0.05 + idx * 0.2;
      });

      // Floating scrolls bobbing & spin
      scrolls.forEach((scroll, idx) => {
        scroll.position.y += Math.sin(time * 1.4 + idx * 1.5) * 0.0025;
        scroll.rotation.x = time * 0.1 + idx;
        scroll.rotation.z = Math.PI / 2 + Math.sin(time * 0.5 + idx) * 0.15;
      });

      // Slow drift stars
      starSystem.rotation.y = time * 0.015;

      // Smooth cinematic camera orbit path
      const orbitRadius = 6.4;
      camera.position.x = Math.sin(time * 0.05) * orbitRadius;
      camera.position.z = Math.cos(time * 0.05) * orbitRadius;
      camera.position.y = 1.2 + Math.sin(time * 0.03) * 0.45;
      camera.lookAt(new THREE.Vector3(-0.85, 0.25, 0));

      renderer.render(scene, camera);
    }

    animateHeroScene();

    // Responsive Resize Handler
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  // ==========================================
  // 3. AUTH FORM INTERACTIVE LOGIC
  // ==========================================
  toggleAuthMode.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    clearAlerts();

    if (isLoginMode) {
      nameFieldGroup.classList.add('hidden');
      regNameInput.removeAttribute('required');
      submitBtn.innerText = 'Sign In';
      toggleText.innerText = "Don't have an account?";
      toggleAuthMode.innerText = 'Register here';
      authCard.classList.remove('glow-emerald');
      authCard.classList.add('glow-indigo');
    } else {
      nameFieldGroup.classList.remove('hidden');
      regNameInput.setAttribute('required', 'true');
      submitBtn.innerText = 'Create Account';
      toggleText.innerText = 'Already have an account?';
      toggleAuthMode.innerText = 'Sign in instead';
      authCard.classList.remove('glow-indigo');
      authCard.classList.add('glow-emerald');
    }
  });

  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlerts();

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const name = regNameInput.value.trim();

    submitBtn.disabled = true;
    submitBtn.innerText = isLoginMode ? 'Signing In...' : 'Registering...';

    try {
      if (isLoginMode) {
        await window.pfAuth.login(email, password);
      } else {
        await window.pfAuth.register(name, email, password);
      }
      window.location.href = 'dashboard.html';
    } catch (err) {
      console.error("Auth error caught:", err);
      
      // Smart Failover: If Firebase email auth provider is disabled
      if (err.code === 'auth/operation-not-allowed' || 
          (err.message && (err.message.includes('disabled') || err.message.includes('operation-not-allowed')))) {
        
        showAlert("⚠️ Firebase Email/Password is disabled in your Firebase console. We are logging you in via Local Sandbox Mode while you enable it!");
        
        setTimeout(() => {
          const fallbackName = name || email.split('@')[0] || 'Student';
          const guestData = { 
            uid: 'guest_fallback_' + Date.now(), 
            email: email, 
            displayName: fallbackName, 
            isGuest: true 
          };
          localStorage.setItem('p10_guest_user', JSON.stringify(guestData));
          window.location.href = 'dashboard.html';
        }, 3000);
        
      } else {
        showAlert(err.message || 'Authentication failed. Please check your credentials.');
        submitBtn.disabled = false;
        submitBtn.innerText = isLoginMode ? 'Sign In' : 'Create Account';
      }
    }
  });

  guestBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.pfAuth.continueAsGuest();
    window.location.href = 'dashboard.html';
  });

  function showAlert(msg) {
    alertBox.innerText = msg;
    alertBox.classList.remove('hidden');
  }

  function clearAlerts() {
    alertBox.classList.add('hidden');
    alertBox.innerText = '';
  }

  document.addEventListener('authReady', (e) => {
    const user = e.detail;
    if (user) {
      window.location.href = 'dashboard.html';
    }
  });
});

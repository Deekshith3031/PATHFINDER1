// Page 5: Gemini AI Advisor Logic
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logout-btn');
  const userDisplayName = document.getElementById('user-display-name');
  const chatMessagesContainer = document.getElementById('chat-messages-container');
  const chatInputForm = document.getElementById('chat-input-form');
  const chatUserInput = document.getElementById('chat-user-input');
  const chatSendBtn = document.getElementById('chat-send-btn');
  const apiModeInfo = document.getElementById('api-mode-info');
  const advisorContextText = document.getElementById('advisor-context-text');
  const aiTypingIndicator = document.getElementById('ai-typing-indicator');

  // Interactive state
  let chatHistory = [];
  let quizResults = null;
  let isThinking = false;

  // 3D Hologram Rotation Rates (will accelerate when thinking)
  let outerRotationSpeed = 0.008;
  let innerRotationSpeed = 0.015;
  let particleOrbitSpeed = 0.01;

  // Handle Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      window.pfAuth.logout();
    });
  }

  // Check Auth State
  document.addEventListener('authReady', async (e) => {
    const user = e.detail;
    if (!user) {
      window.location.href = 'index.html';
      return;
    }
    if (userDisplayName) userDisplayName.innerText = `${user.displayName} (${user.isGuest ? 'Guest' : 'Student'})`;

    // Load Quiz Results Context
    quizResults = await window.pfDb.getQuizResults();
    if (quizResults && advisorContextText) {
      advisorContextText.innerText = `Personalized Profile Active (Recommended: ${quizResults.recommendedPath})`;
    }
  });

  // Query server API setup on initialization
  checkApiStatus();

  // Initialize 3D Hologram Core
  initHologramCore();

  // Bind Form Submit
  chatInputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    submitUserMessage();
  });

  // Bind Suggested Chips
  document.querySelectorAll('.chip-btn').forEach(chip => {
    chip.addEventListener('click', () => {
      chatUserInput.value = chip.innerText.trim();
      submitUserMessage();
    });
  });

  // Bind Clear Chat Button
  const clearChatBtn = document.getElementById('clear-chat-btn');
  if (clearChatBtn) {
    clearChatBtn.addEventListener('click', () => {
      chatHistory = [];
      // Rebuild with just the welcome message
      chatMessagesContainer.innerHTML = `
        <div class="flex items-start space-x-3 max-w-[85%] animate-fade-in">
          <div class="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-400/50 flex items-center justify-center shrink-0">🤖</div>
          <div class="p-4 bg-indigo-950/30 border border-indigo-500/20 rounded-2xl rounded-tl-none text-sm text-slate-200 leading-relaxed shadow-md">
            <p>Chat cleared! Ask me anything about your career options — Intermediate (MPC/BiPC/CEC), Polytechnic Diploma (TS POLYCET), or ITI Trades. 🌟</p>
          </div>
        </div>
      `;
      // Re-show chips
      const chips = document.getElementById('suggested-chips');
      if (chips) chips.style.display = 'flex';
    });
  }

  // Check backend configuration
  async function checkApiStatus() {
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      if (data.hasGeminiKey) {
        apiModeInfo.innerHTML = `<span class="text-emerald-400 font-semibold">🟢 Gemini-2.5-Flash (Live)</span>`;
      } else {
        apiModeInfo.innerHTML = `<span class="text-amber-400 font-semibold">🟡 Demo Simulator Mode</span>`;
      }
    } catch (err) {
      apiModeInfo.innerHTML = `<span class="text-red-400 font-semibold">🔴 Off-line (Mock Mode)</span>`;
    }
  }

  // Submit message to backend Express route
  async function submitUserMessage() {
    const prompt = chatUserInput.value.trim();
    if (!prompt || isThinking) return;

    // Clear input & disable controls
    chatUserInput.value = '';
    setThinkingState(true);

    // Append user message bubble
    appendMessageBubble('user', prompt);
    chatHistory.push({ sender: 'user', text: prompt });

    // Scroll to bottom
    scrollToBottom();

    // Create thinking indicator bubble
    const typingBubble = appendTypingIndicator();
    scrollToBottom();

    try {
      const response = await fetch('/api/advisor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: chatHistory,
          quizResults: quizResults
        })
      });

      // Remove typing bubble
      typingBubble.remove();

      if (!response.ok) {
        throw new Error('API server returned an error.');
      }

      const data = await response.json();
      const reply = data.text;

      // Append advisor reply bubble with typewriter streaming effect
      appendMessageBubble('ai', reply);
      chatHistory.push({ sender: 'ai', text: reply });

      // Animate the ai-message-body content word-by-word
      const allBubbles = chatMessagesContainer.querySelectorAll('.ai-message-body');
      const lastBody = allBubbles[allBubbles.length - 1];
      if (lastBody) {
        const finalHTML = lastBody.innerHTML;
        lastBody.innerHTML = '';
        lastBody.style.minHeight = '1.5em';
        // Stream words into the div with slight delay
        const words = finalHTML.split(/(\s+)/);
        let wordIdx = 0;
        const streamInterval = setInterval(() => {
          if (wordIdx < words.length) {
            lastBody.innerHTML += words[wordIdx];
            wordIdx++;
            scrollToBottom();
          } else {
            clearInterval(streamInterval);
            lastBody.style.minHeight = '';
          }
        }, 18);
      }

      scrollToBottom();

    } catch (error) {
      console.error(error);
      typingBubble.remove();
      appendMessageBubble('ai', `⚠️ **Error connecting to AI Advisor.** Please check that the server is active, or retry in a moment.`);
      scrollToBottom();
    } finally {
      setThinkingState(false);
    }
  }

  // Toggle Thinking Visual states (Hologram speedup)
  function setThinkingState(thinking) {
    isThinking = thinking;
    chatUserInput.disabled = thinking;
    chatSendBtn.disabled = thinking;

    if (thinking) {
      // Speed up the 3D rotating rings
      outerRotationSpeed = 0.055;
      innerRotationSpeed = 0.088;
      particleOrbitSpeed = 0.06;
      if (aiTypingIndicator) aiTypingIndicator.classList.remove('hidden');
    } else {
      // Reset rotation speeds
      outerRotationSpeed = 0.008;
      innerRotationSpeed = 0.015;
      particleOrbitSpeed = 0.01;
      if (aiTypingIndicator) aiTypingIndicator.classList.add('hidden');
    }
  }

  // Append HTML chat balloons
  function appendMessageBubble(sender, text) {
    const bubble = document.createElement('div');
    const isUser = sender === 'user';
    
    bubble.className = isUser 
      ? "flex items-start space-x-3 max-w-[85%] ml-auto justify-end" 
      : "flex items-start space-x-3 max-w-[85%]";

    // Enhanced Markdown Parser
    const parseMarkdown = (txt) => {
        return txt
            .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold my-2">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold my-2">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold my-2">$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code class="bg-black/30 px-1 rounded font-mono text-xs">$1</code>')
            .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
            .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')
            .replace(/\n/g, '<br>');
    };

    const copyBtnHtml = !isUser ? `
        <button onclick="navigator.clipboard.writeText(\`${text.replace(/`/g, '\\`')}\`)" 
                class="absolute top-2 right-2 p-1 text-slate-500 hover:text-white transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
        </button>` : '';

    bubble.innerHTML = isUser
      ? `
        <div class="p-4 bg-cyan-950/45 border border-cyan-500/25 rounded-2xl rounded-tr-none text-sm text-slate-200 leading-relaxed shadow-md">
          <p>${parseMarkdown(text)}</p>
        </div>
        <div class="w-8 h-8 rounded-full bg-cyan-600/30 border border-cyan-400/50 flex items-center justify-center shrink-0">🧑‍🎓</div>
      `
      : `
        <div class="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-400/50 flex items-center justify-center shrink-0">🤖</div>
        <div class="relative p-4 bg-indigo-950/30 border border-indigo-500/20 rounded-2xl rounded-tl-none text-sm text-slate-200 leading-relaxed shadow-md">
          ${copyBtnHtml}
          <div class="ai-message-body">${parseMarkdown(text)}</div>
        </div>
      `;

    bubble.classList.add('animate-fade-in');
    chatMessagesContainer.appendChild(bubble);
  }

  function appendTypingIndicator() {
    const bubble = document.createElement('div');
    bubble.className = "flex items-start space-x-3 max-w-[85%]";
    bubble.innerHTML = `
      <div class="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-400/50 flex items-center justify-center shrink-0 animate-pulse">
        🤖
      </div>
      <div class="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl rounded-tl-none text-xs text-slate-400 flex items-center space-x-2">
        <span class="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style="animation-delay: 0.1s"></span>
        <span class="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style="animation-delay: 0.2s"></span>
        <span class="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style="animation-delay: 0.3s"></span>
      </div>
    `;
    chatMessagesContainer.appendChild(bubble);
    return bubble;
  }

  function scrollToBottom() {
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
  }

  // ==========================================
  // THREE.JS 3D HOLOGRAM CORE ENGINE
  // ==========================================
  function initHologramCore() {
    const canvas = document.getElementById('hologram-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    
    // Camera
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 4.2;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x06b2d2, 1.5, 10);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x6366f1, 1.2, 10);
    pointLight2.position.set(1, 1, 1);
    scene.add(pointLight2);

    // Core Group
    const coreGroup = new THREE.Group();

    // 1. Center pulsing core sphere
    const sphereGeo = new THREE.SphereGeometry(0.35, 12, 12);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6, // Violet
      wireframe: true,
      transparent: true,
      opacity: 0.7
    });
    const centerCore = new THREE.Mesh(sphereGeo, sphereMat);
    coreGroup.add(centerCore);

    // 2. Outer ring (Cyan Torus)
    const outerTorusGeo = new THREE.TorusGeometry(0.9, 0.025, 8, 36);
    const cyanMat = new THREE.MeshBasicMaterial({
      color: 0x06b2d2, // Cyan
      wireframe: true,
      transparent: true,
      opacity: 0.65
    });
    const outerRing = new THREE.Mesh(outerTorusGeo, cyanMat);
    coreGroup.add(outerRing);

    // 3. Inner ring (Indigo Torus, smaller, perpendicular alignment)
    const innerTorusGeo = new THREE.TorusGeometry(0.65, 0.02, 8, 32);
    const indigoMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1, // Indigo
      wireframe: true,
      transparent: true,
      opacity: 0.65
    });
    const innerRing = new THREE.Mesh(innerTorusGeo, indigoMat);
    innerRing.rotation.x = Math.PI / 2;
    coreGroup.add(innerRing);

    // 4. Little orbiting nodes (Particles)
    const nodeCount = 45;
    const nodeGeo = new THREE.BufferGeometry();
    const nodePositions = new Float32Array(nodeCount * 3);
    const nodeRadii = [];
    const nodeAngles = [];
    const nodeAxes = []; // Vector orientation for rotation

    for (let i = 0; i < nodeCount; i++) {
      const idx = i * 3;
      const radius = 0.5 + Math.random() * 0.75;
      const angle = Math.random() * Math.PI * 2;
      
      nodeRadii.push(radius);
      nodeAngles.push(angle);

      // Random rotational axis vector
      const axis = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
      ).normalize();
      nodeAxes.push(axis);

      nodePositions[idx] = Math.cos(angle) * radius;
      nodePositions[idx + 1] = Math.sin(angle) * radius;
      nodePositions[idx + 2] = (Math.random() - 0.5) * 0.4;
    }

    nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
    const nodeTextureCanvas = document.createElement('canvas');
    nodeTextureCanvas.width = 16;
    nodeTextureCanvas.height = 16;
    const nodeCtx = nodeTextureCanvas.getContext('2d');
    const g = nodeCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    nodeCtx.fillStyle = g;
    nodeCtx.fillRect(0, 0, 16, 16);
    const nodeTexture = new THREE.CanvasTexture(nodeTextureCanvas);

    const nodeMat = new THREE.PointsMaterial({
      size: 0.07,
      color: 0x06b2d2,
      map: nodeTexture,
      transparent: true,
      blending: THREE.NormalBlending,
      depthWrite: false
    });
    
    const nodesSystem = new THREE.Points(nodeGeo, nodeMat);
    coreGroup.add(nodesSystem);

    scene.add(coreGroup);

    // Watch Resize
    const resizeObserver = new ResizeObserver(() => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    resizeObserver.observe(canvas);

    // Clock
    const clock = new THREE.Clock();

    // Animation Loop
    function renderHologram() {
      requestAnimationFrame(renderHologram);

      const time = clock.getElapsedTime();

      // Dynamic rainbow color-shifting over time
      const hueOuter = (time * 0.04) % 1.0;
      const hueInner = (time * 0.06 + 0.3) % 1.0;
      const hueCore = (time * 0.08 + 0.6) % 1.0;
      const hueNodes = (time * 0.05) % 1.0;

      outerRing.material.color.setHSL(hueOuter, 0.95, 0.55);
      innerRing.material.color.setHSL(hueInner, 0.95, 0.55);
      centerCore.material.color.setHSL(hueCore, 0.9, 0.55);
      nodesSystem.material.color.setHSL(hueNodes, 0.95, 0.55);

      // Rotations on multiple axes
      outerRing.rotation.y += outerRotationSpeed;
      outerRing.rotation.x += outerRotationSpeed * 0.5;

      innerRing.rotation.x -= innerRotationSpeed;
      innerRing.rotation.y += innerRotationSpeed * 0.3;

      // Pulsing Scale logic (accelerates dynamically)
      const scaleMultiplier = isThinking ? 15 : 3.5;
      const pulseScale = 0.8 + Math.sin(time * scaleMultiplier) * (isThinking ? 0.28 : 0.08);
      centerCore.scale.setScalar(pulseScale);
      
      // Update Orbiting Nodes
      const positionsAttr = nodesSystem.geometry.attributes.position;
      for (let i = 0; i < nodeCount; i++) {
        const idx = i * 3;
        
        // Progress angle
        nodeAngles[i] += particleOrbitSpeed;
        const currentAngle = nodeAngles[i];
        const radius = nodeRadii[i];
        
        // Orbit mathematics (around respective randomized orientation axes)
        const axis = nodeAxes[i];
        
        // Generate planar orbit vectors
        const x = Math.cos(currentAngle) * radius;
        const y = Math.sin(currentAngle) * radius;

        positionsAttr.setX(i, x);
        positionsAttr.setY(i, y);
      }
      positionsAttr.needsUpdate = true;

      renderer.render(scene, camera);
    }
    
    renderHologram();
  }
});

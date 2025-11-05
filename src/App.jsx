import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import advlogo from './assets/adv.png';
import schoollogo from './assets/school.png';
import kidslogo from './assets/kids.png';
import prologo from './assets/pro.png';

const App = ({ onComplete, onPlatformSelect }) => {
  const [phase, setPhase] = useState('fade-in');
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [logoVisibility, setLogoVisibility] = useState([false, false, false, false]);
  const [burstId, setBurstId] = useState(null);
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  const platforms = [
    { id: 'kids', name: 'Kids StageUp', icon: kidslogo, description: 'Creative Learning for Young Minds', link: 'https://stageup.in/' },
    { id: 'school', name: 'School StageUp', icon: schoollogo, description: 'Comprehensive School Education', link: 'https://stageup.in/' },
    { id: 'adv', name: 'ADV StageUp', icon: advlogo, description: 'Advanced Skill Development Mastery', link: "https://stageuppro.netlify.app/" },
    { id: 'pro', name: 'Pro StageUp', icon: prologo, description: 'Professional Growth & Development', link: "https://stageuppro.netlify.app/" }
  ];

  // ---------- Three.js scene ----------
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xffd4c0, 0.002);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 1);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setClearColor(0x000000, 0);

    // ---------- Lights ----------
    const ambient = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambient);

    const accentColor = new THREE.Color(0xff6b35); // orange accent
    const light1 = new THREE.PointLight(accentColor, 1.2, 120);
    light1.position.set(-30, 20, 10);
    scene.add(light1);

    const light2 = new THREE.PointLight(new THREE.Color(0xff9966), 0.8, 100);
    light2.position.set(30, -10, 20);
    scene.add(light2);

    // ---------- Soft gradient spheres ----------
    const sphereGeo = new THREE.SphereGeometry(10, 32, 32);
    const sphereMat1 = new THREE.MeshBasicMaterial({ color: 0xff8c66, transparent: true, opacity: 0.12 });
    const sphere1 = new THREE.Mesh(sphereGeo, sphereMat1);
    sphere1.position.set(-18, 6, -30);
    sphere1.scale.set(1.6, 1.0, 1);
    scene.add(sphere1);

    const sphereMat2 = new THREE.MeshBasicMaterial({ color: 0xffb088, transparent: true, opacity: 0.1 });
    const sphere2 = new THREE.Mesh(sphereGeo, sphereMat2);
    sphere2.position.set(18, -6, -28);
    sphere2.scale.set(1.8, 1.2, 1);
    scene.add(sphere2);

    // ---------- Depth grid ----------
    const gridSize = 200;
    const gridDivisions = 40;
    const grid = new THREE.GridHelper(gridSize, gridDivisions, 0xffccaa, 0xffe0cc);
    grid.material.opacity = 0.15;
    grid.material.transparent = true;
    grid.rotation.x = Math.PI / 2;
    grid.position.z = -40;
    scene.add(grid);

    // Cubes removed - only text symbols remain

    // ---------- Floating code symbol sprites ----------
    const codeSymbols = ['{ }', '< />', '()</>', 'if', 'fn', 'AI', 'const', 'let', 'react', 'node', 'C','JAVA','AI & ML' , 'JS', 'CSS', 'HTML', '==', '!=',];
    const spriteElements = [];
    const spriteCanvasCache = [];

    codeSymbols.forEach((symbol, idx) => {
      const canvas = document.createElement('canvas');
      canvas.width = 456;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(0,0,0,0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = 'bold 80px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, 'rgba(255,107,53,1)');
      grad.addColorStop(1, 'rgba(255,153,102,1)');

      ctx.shadowColor = 'rgba(255,107,53,0.45)';
      ctx.shadowBlur = 18;
      ctx.fillStyle = grad;
      ctx.fillText(symbol, canvas.width / 2, canvas.height / 2);

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      spriteCanvasCache.push(texture);

      const spriteMat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.95,
        depthWrite: false
      });

      const sprite = new THREE.Sprite(spriteMat);
      const scale = 3.6 + Math.random() * 1.8;
      sprite.scale.set(scale, scale, 1);
      sprite.position.set((Math.random() - 0.5) * 36, (Math.random() - 0.5) * 20, -6 - Math.random() * 8);
      sprite.userData = {
        initialY: sprite.position.y,
        floatSpeed: 0.6 + Math.random() * 0.9,
        sway: Math.random() * 0.4
      };
      spriteElements.push(sprite);
      scene.add(sprite);
    });

    // ---------- EDGE PARTICLES (4 sides - STATIC at edges) ----------
    const edgeParticleCount = 300;
    const edgePositions = new Float32Array(edgeParticleCount * 3);
    const edgeVelocities = [];
    
    for (let i = 0; i < edgeParticleCount; i++) {
      const side = i % 4; // 0=left, 1=right, 2=top, 3=bottom
      const aspect = window.innerWidth / window.innerHeight;
      const viewHeight = 2 * Math.tan((50 * Math.PI / 180) / 2) * 30;
      const viewWidth = viewHeight * aspect;
      
      let x, y;
      const edgeOffset = 0.5; // Keep particles AT the edge
      
      if (side === 0) { // left edge
        x = -viewWidth / 2 - edgeOffset;
        y = (Math.random() - 0.5) * viewHeight * 1.2;
      } else if (side === 1) { // right edge
        x = viewWidth / 2 + edgeOffset;
        y = (Math.random() - 0.5) * viewHeight * 1.2;
      } else if (side === 2) { // top edge
        x = (Math.random() - 0.5) * viewWidth * 1.2;
        y = viewHeight / 2 + edgeOffset;
      } else { // bottom edge
        x = (Math.random() - 0.5) * viewWidth * 1.2;
        y = -viewHeight / 2 - edgeOffset;
      }
      
      edgePositions[i * 3] = x;
      edgePositions[i * 3 + 1] = y;
      edgePositions[i * 3 + 2] = (Math.random() - 0.5) * 5;
      
      // Store initial position and side for reset
      edgeVelocities.push({
        side: side,
        initialX: x,
        initialY: y,
        floatSpeed: 0.3 + Math.random() * 0.5,
        floatOffset: Math.random() * Math.PI * 2
      });
    }
    
    const edgePGeo = new THREE.BufferGeometry();
    edgePGeo.setAttribute('position', new THREE.BufferAttribute(edgePositions, 3));
    const edgePMat = new THREE.PointsMaterial({
      size: 0.2,
      transparent: true,
      opacity: 0.95,
      color: 0xff8855,
      blending: THREE.AdditiveBlending
    });
    const edgeParticles = new THREE.Points(edgePGeo, edgePMat);
    scene.add(edgeParticles);

    // ---------- Mouse tracking ----------
    const onMouseMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove);

    // ---------- Animation loop ----------
    let animationId;
    let t = 0;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      t += 0.008;

      // float sprites
      spriteElements.forEach((s, i) => {
        s.position.y = s.userData.initialY + Math.sin(t * s.userData.floatSpeed + i) * 1.4;
        s.position.x += Math.sin(t * 0.4 + i) * 0.002 * s.userData.sway;
        s.material.rotation = Math.sin(t * 0.3 + i) * 0.12;
      });

      // EDGE PARTICLES: float along edges, stay at screen borders
      const edgePos = edgeParticles.geometry.attributes.position.array;
      
      for (let i = 0; i < edgeParticleCount; i++) {
        const data = edgeVelocities[i];
        const side = data.side;
        
        // Float motion along the edge
        if (side === 0 || side === 1) {
          // Left/right edges: float up and down
          edgePos[i * 3 + 1] = data.initialY + Math.sin(t * data.floatSpeed + data.floatOffset) * 2;
        } else {
          // Top/bottom edges: float left and right
          edgePos[i * 3] = data.initialX + Math.sin(t * data.floatSpeed + data.floatOffset) * 2;
        }
        
        // Gentle z-axis movement for depth
        edgePos[i * 3 + 2] += Math.sin(t * 0.5 + i) * 0.01;
      }
      edgeParticles.geometry.attributes.position.needsUpdate = true;

      // subtle parallax camera movement
      const targetX = mouseRef.current.x * 4;
      const targetY = mouseRef.current.y * 2;
      camera.position.x += (targetX - camera.position.x) * 0.06;
      camera.position.y += (targetY - camera.position.y) * 0.06;
      camera.lookAt(0, 0, -10);

      // move grid
      grid.position.x = Math.sin(t * 0.07) * 6;
      grid.position.y = Math.cos(t * 0.05) * 3;

      renderer.render(scene, camera);
    };
    animate();

    // ---------- Handle resize ----------
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // ---------- Cleanup ----------
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animationId);

      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => {
              if (m.map) m.map.dispose();
              m.dispose();
            });
          } else {
            if (obj.material.map) obj.material.map.dispose();
            obj.material.dispose();
          }
        }
      });

      spriteCanvasCache.forEach(tex => {
        try { tex.dispose(); } catch (e) {}
      });

      renderer.dispose();
    };
  }, []);

  // ---------- UI fade/logo timings ----------
  useEffect(() => {
    const timers = [];
    logoVisibility.forEach((_, i) => {
      timers.push(setTimeout(() => {
        setLogoVisibility(prev => {
          const copy = [...prev];
          copy[i] = true;
          return copy;
        });
      }, i * 200 + 300));
    });

    timers.push(setTimeout(() => setPhase('showing'), 1500));
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  // ---------- Interaction ----------
  const handlePlatformSelect = (platform) => {
    setSelectedPlatform(platform.id);

    setPhase('selected');
    setTimeout(() => {
      setPhase('fade-out');
      setTimeout(() => {
        onComplete && onComplete(platform.id);
        onPlatformSelect && onPlatformSelect(platform.id);
      }, 500);
    }, 800);
  };

  // ---------- Render ----------
  return (
    <div className="relative min-h-screen" style={{ background: 'linear-gradient(180deg, #fff5f0 0%, #ffe8dc 50%, #ffd4c0 100%)' }}>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0"
        style={{ height: '70%', width:'200%'  }}
      />

      <div className={`relative inset-0 z-50 flex flex-col transition-all duration-700 ${phase === 'fade-out' ? 'opacity-0' : 'opacity-100'}`}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

          /* 3D hover tilt effect */
          @keyframes cardHover {
            0% { transform: perspective(1000px) rotateX(0) rotateY(0) scale(1); }
            100% { transform: perspective(1000px) rotateX(-5deg) rotateY(5deg) scale(1.05); }
          }

          /* Burst effect on click */
          @keyframes cardBurst {
            0% { 
              transform: perspective(1000px) scale(1) rotateZ(0deg);
              box-shadow: 0 10px 30px rgba(255,107,53,0.2);
            }
            25% { 
              transform: perspective(1000px) scale(1.12) rotateZ(2deg);
              box-shadow: 0 20px 60px rgba(255,107,53,0.4);
            }
            50% { 
              transform: perspective(1000px) scale(0.95) rotateZ(-1deg);
              box-shadow: 0 15px 45px rgba(255,107,53,0.3);
            }
            75% { 
              transform: perspective(1000px) scale(1.05) rotateZ(1deg);
              box-shadow: 0 18px 50px rgba(255,107,53,0.35);
            }
            100% { 
              transform: perspective(1000px) scale(1) rotateZ(0deg);
              box-shadow: 0 10px 30px rgba(255,107,53,0.2);
            }
          }

          /* Glow pulse on burst */
          @keyframes glowPulse {
            0%, 100% { filter: brightness(1) drop-shadow(0 0 0px rgba(255,107,53,0)); }
            50% { filter: brightness(1.1) drop-shadow(0 0 20px rgba(255,107,53,0.6)); }
          }

          .hover-anim {
            transform-style: preserve-3d;
            will-change: transform;
            transition: all 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          
          .hover-anim:hover {
            animation: cardHover 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }

          .burst {
            animation: cardBurst 450ms cubic-bezier(0.34, 1.56, 0.64, 1), glowPulse 450ms ease-out;
          }

          .card-disabled {
            pointer-events: none;
            opacity: 0.6;
            transform: none !important;
          }

          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-scroll { animation: scroll 40s linear infinite; }
          .animate-scroll:hover { animation-play-state: paused; }
        `}</style>

        <div className="relative z-10  w-full px-5 sm:px-6 mx-auto flex-1 flex flex-col justify-center py-2">
         {/* Header */}
          <div className={`relative text-center mb-12 transition-all duration-700 delay-100 }`}>
            {/* Certification Logos - Top Right */}
            <div className="sm:absolute sm:right-4 flex justify-center top-0 items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm border-2 border-orange-200 hover:border-orange-300 transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg">
                <img 
                  src="https://www.arenasolutions.com/wp-content/uploads/what-is-iso-9001-compliance.png" 
                  alt="ISO Certified" 
                  className="w-full h-full object-contain"
                  title="ISO Certified"
                />
              </div>
              <div className="w-14 h-14 rounded-full overflow-hidden bg-white/90 backdrop-blur-sm border-2 border-orange-200 hover:border-orange-300 transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg">
                <img 
                  src="https://5.imimg.com/data5/SELLER/Default/2020/8/PQ/PG/RM/111471935/msme-registration-service-500x500.jpg" 
                  alt="NCS Certified" 
                  className="w-full h-full object-contain"
                  title="NCS Certified"
                />
              </div>
              <div className="w-14 h-14 overflow-hidden rounded-full bg-white/90 backdrop-blur-sm border-2 border-orange-200 hover:border-orange-300 transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg">
                <img 
                  src="https://gowindinternational.com/wp-content/uploads/2025/05/DGFT.png" 
                  alt="DGFT Certified" 
                  className="w-full h-full object-contain"
                  title="DGFT Certified"
                />
              </div>
              <div className="w-14 h-14 overflow-hidden rounded-full bg-white/90 backdrop-blur-sm border-2 border-orange-200 hover:border-orange-300 transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg">
                <img 
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcCrpzGPB9h0k5isIKYD23fFFP8u9CatVGA2c2-rmaTrDX5wRAjvfOMojrglo7PxSiduM&usqp=CAU" 
                  alt="NCS Accredited" 
                  className="w-full h-full object-contain "
                  title="NCS Accredited"
                />
              </div>
            </div>

            <h1 className="text-3xl md:text-5xl font-semibold text-gray-900 mb-3 mt-4 sm:mt-16 leading-tight tracking-tight">
              StageUp – Empowering the Future Coders of India
            </h1>
            <p className="text-gray-600 text-lg md:text-xl mb-4 font-medium">
              "From Curiosity to Career – A Complete Coding Journey"
            </p>
            <div className="w-20 h-0.5 bg-gray-900 mx-auto"></div>
          </div>

          {/* Platform Cards */}
          <div className="grid grid-cols-1 max-w-6xl mx-auto md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {platforms.map((platform, index) => (
              <div
                key={platform.id}
                onClick={() => {
                  if (phase !== 'showing') return;

                  setBurstId(platform.id);
                  setTimeout(() => setBurstId(null), 500);

                  if (platform.link) {
                    window.open(platform.link, "_blank");
                    return;
                  }

                  handlePlatformSelect(platform);
                }}
                className={`hover-anim transition-all duration-500 ${logoVisibility[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${selectedPlatform === null ? 'scale-100' : selectedPlatform === platform.id ? 'scale-105' : 'scale-95 opacity-50'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className={`
                  relative bg-white/80 backdrop-blur-sm rounded-xl border-2 border-orange-200 p-8
                  transform transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl
                `}>
                  {/* Icon */}
                  <div className="flex justify-center mb-6">
                    <div className="w-24 h-20 rounded-2xl bg-orange-50 flex items-center justify-center text-4xl">
                      <img src={platform.icon} alt="" className=''  style={{ mixBlendMode: "multiply" }} />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                    {platform.name}
                  </h3>

                  <p className="text-gray-600 text-sm text-center mb-6">
                    {platform.description}
                  </p>

                  {/* Button */}
                  <div className="flex justify-center">
                    <div className={`
                      inline-flex items-center gap-2 text-sm font-medium
                      ${selectedPlatform === platform.id ? 'text-orange-600' : 'text-orange-700'}
                      group-hover:text-orange-800 transition-colors
                    `}>
                      {platform.link ? 'Visit Platform' : 'Get Started'}
                      <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scrolling certification badges section */}
        <div className={`relative z-10 py-6 border-t border-orange-200 bg-white/70 backdrop-blur-sm transition-all duration-700 delay-300 ${logoVisibility[1] ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-full px-4">
            <h3 className="text-center text-gray-500 text-sm font-medium mb-6 tracking-wider uppercase">
              We Are Supported By
            </h3>

            <div className="relative overflow-hidden mb-2">
              <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white/70 to-transparent z-10"></div>
              <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white/70 to-transparent z-10"></div>

              <div className="flex animate-scroll">
                {/* First Set */}
                <div className="flex items-center gap-8 px-4">
                  <div className="flex-shrink-0 bg-white/90 backdrop-blur-sm rounded-xl px-8 py-5 border-2 border-orange-200 hover:border-orange-300 transition-all duration-300 group min-w-[200px]">
                    <img 
                      src="https://images.squarespace-cdn.com/content/v1/586fa54b6b8f5b0e75049b90/1591119029204-5XK9IQ794J82WFIMTF0D/google+for+ed.png" 
                      alt="Google for Education" 
                      className="h-12 w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                  <div className="flex-shrink-0 bg-white/90 backdrop-blur-sm rounded-xl px-8 py-5 border-2 border-orange-200 hover:border-orange-300 transition-all duration-300 group min-w-[200px]">
                    <img 
                      src="https://juniortech.org/wp-content/uploads/2020/09/Scratch-cat-logo-300x300px.png" 
                      alt="Scratch" 
                      className="h-12 w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                  <div className="flex-shrink-0 bg-white/90 backdrop-blur-sm rounded-xl px-8 py-5 border-2 border-orange-200 hover:border-orange-300 transition-all duration-300 group min-w-[200px]">
                    <img 
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvzVXAptl-ucJ6LkNUjR3GWZQsYkJi2FJOl6aFzkzWdlA3hgsj0VXdkbpO1BabZtuhMcg&usqp=CAU" 
                      alt="CodePen" 
                      className="h-12 w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                  <div className="flex-shrink-0 bg-white/90 backdrop-blur-sm rounded-xl px-2 py-2 border-2 border-orange-200 hover:border-orange-300 transition-all duration-300 group min-w-[200px]">
                    <img 
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcReHxPC-DGRTX_9_vQFhQbAtNNV6ccTxgOnuQ&s" 
                      alt="Khan Academy" 
                      className="h-20 w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Second Set */}
                <div className="flex items-center gap-8 px-4">
                  <div className="flex-shrink-0 bg-white/90 backdrop-blur-sm rounded-xl px-8 py-5 border-2 border-orange-200 hover:border-orange-300 transition-all duration-300 group min-w-[200px]">
                    <img 
                      src="https://images.squarespace-cdn.com/content/v1/586fa54b6b8f5b0e75049b90/1591119029204-5XK9IQ794J82WFIMTF0D/google+for+ed.png" 
                      alt="Google for Education" 
                      className="h-12 w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                  <div className="flex-shrink-0 bg-white/90 backdrop-blur-sm rounded-xl px-8 py-5 border-2 border-orange-200 hover:border-orange-300 transition-all duration-300 group min-w-[200px]">
                    <img 
                      src="https://juniortech.org/wp-content/uploads/2020/09/Scratch-cat-logo-300x300px.png" 
                      alt="Scratch" 
                      className="h-12 w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                  <div className="flex-shrink-0 bg-white/90 backdrop-blur-sm rounded-xl px-8 py-5 border-2 border-orange-200 hover:border-orange-300 transition-all duration-300 group min-w-[200px]">
                    <img 
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvzVXAptl-ucJ6LkNUjR3GWZQsYkJi2FJOl6aFzkzWdlA3hgsj0VXdkbpO1BabZtuhMcg&usqp=CAU" 
                      alt="CodePen" 
                      className="h-12 w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                  <div className="flex-shrink-0 bg-white/90 backdrop-blur-sm rounded-xl px-2 py-2 border-2 border-orange-200 hover:border-orange-300 transition-all duration-300 group min-w-[200px]">
                    <img 
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcReHxPC-DGRTX_9_vQFhQbAtNNV6ccTxgOnuQ&s" 
                      alt="Khan Academy" 
                      className="h-20 w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Third Set */}
                <div className="flex items-center gap-8 px-4">
                  <div className="flex-shrink-0 bg-white/90 backdrop-blur-sm rounded-xl px-8 py-5 border-2 border-orange-200 hover:border-orange-300 transition-all duration-300 group min-w-[200px]">
                    <img 
                      src="https://images.squarespace-cdn.com/content/v1/586fa54b6b8f5b0e75049b90/1591119029204-5XK9IQ794J82WFIMTF0D/google+for+ed.png" 
                      alt="Google for Education" 
                      className="h-12 w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                  <div className="flex-shrink-0 bg-white/90 backdrop-blur-sm rounded-xl px-8 py-5 border-2 border-orange-200 hover:border-orange-300 transition-all duration-300 group min-w-[200px]">
                    <img 
                      src="https://juniortech.org/wp-content/uploads/2020/09/Scratch-cat-logo-300x300px.png" 
                      alt="Scratch" 
                      className="h-12 w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                  <div className="flex-shrink-0 bg-white/90 backdrop-blur-sm rounded-xl px-8 py-5 border-2 border-orange-200 hover:border-orange-300 transition-all duration-300 group min-w-[200px]">
                    <img 
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvzVXAptl-ucJ6LkNUjR3GWZQsYkJi2FJOl6aFzkzWdlA3hgsj0VXdkbpO1BabZtuhMcg&usqp=CAU" 
                      alt="CodePen" 
                      className="h-12 w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                  <div className="flex-shrink-0 bg-white/90 backdrop-blur-sm rounded-xl px-2 py-2 border-2 border-orange-200 hover:border-orange-300 transition-all duration-300 group min-w-[200px]">
                    <img 
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcReHxPC-DGRTX_9_vQFhQbAtNNV6ccTxgOnuQ&s" 
                      alt="Khan Academy" 
                      className="h-20 w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 py-3 bg-white/70 backdrop-blur-sm border-t border-orange-200">
          <p className="text-center text-gray-500 text-xs font-medium">
            © 2025 StageUp. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
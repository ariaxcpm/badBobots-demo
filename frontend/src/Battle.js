import { useEffect, useRef, useState, useMemo } from "react";
import placeholder from "./assets/placeholder.svg";

const CARD_DEFS = {
  swordsman: {
    id: "swordsman",
    name: "Swordsman",
    era_required: "stone_age",
    cost_gold: 15,
    cost_food: 5,
    cost_materials: 0,
    cost_gems: 0,
    hp: 100,
    damage: 20,
    attack_cooldown: 1,
    speed: 0.8,
    range: 45,
    target_type: "ground",
    spawn_time: 1000,
    cooldown: 2000,
    special_effects: {},
    rarity: "common",
    description: "Basic melee infantry.",
    flying: false,
    animations: {
      walk: [placeholder, placeholder],
      attack: [placeholder, placeholder]
    },
  },
  archer: {
    id: "archer",
    name: "Archer",
    era_required: "bronze_age",
    cost_gold: 20,
    cost_food: 10,
    cost_materials: 0,
    cost_gems: 0,
    hp: 70,
    damage: 15,
    attack_cooldown: 1,
    speed: 0.8,
    range: 120,
    target_type: "both",
    spawn_time: 1000,
    cooldown: 2500,
    special_effects: {},
    rarity: "common",
    description: "Ranged attacker with arrows.",
    flying: false,
    animations: {
      walk: [placeholder, placeholder],
      attack: [placeholder, placeholder]
    },
  },
  tank: {
    id: "tank",
    name: "Tank",
    era_required: "bronze_age",
    cost_gold: 40,
    cost_food: 0,
    cost_materials: 20,
    cost_gems: 0,
    hp: 300,
    damage: 40,
    attack_cooldown: 1.5,
    speed: 0.6,
    range: 45,
    target_type: "ground",
    spawn_time: 2000,
    cooldown: 5000,
    special_effects: { aoe_blast: true },
    rarity: "rare",
    description: "Heavy armored unit, effective at close combat.",
    flying: false,
    animations: {
      walk: [placeholder, placeholder],
      attack: [placeholder, placeholder]
    },
  },
};

// کش تصاویر برای جلوگیری از لود مکرر
const loadImage = (src) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = src;
  });
};

const preloadImages = async () => {
  const allImages = [];
  Object.values(CARD_DEFS).forEach((card) => {
    // لود همه انیمیشن‌ها
    Object.values(card.animations).forEach(animFrames => {
      animFrames.forEach(src => allImages.push(loadImage(src)));
    });
  });
  return Promise.all(allImages);
};

export default function Battle() {
  // با این بخش جدید:
  const unitsRef = useRef([]);
  const projectilesRef = useRef([]);
  // این state ها فقط برای همگام‌سازی با UI در انتهای هر فریم هستند
  const [units, setUnits] = useState([]);
  const [projectiles, setProjectiles] = useState([]);
  const lastSyncTimeRef = useRef(0);

  const canvasRef = useRef(null);
  const imageCacheRef = useRef({});
  const [gold, setGold] = useState(5000000000);
  const [food, setFood] = useState(50);
  const [playerBaseHp, setPlayerBaseHp] = useState(500);
  const [enemyBaseHp, setEnemyBaseHp] = useState(500);
  const damageQueueRef = useRef([]);
  // ابعاد واقعی تصویر bridge.png
  const BRIDGE_IMG_WIDTH = 3840;
  const BRIDGE_IMG_HEIGHT = 1591;

  // بخشی از تصویر که مسیر واقعی هست (توی تصویر اصلی)
  const DESIRED_BRIDGE_HEIGHT = 200; // ارتفاعی که می‌خوای روی صفحه داشته باشه

  // موقعیت و ارتفاع مسیر روی canvas
  const BRIDGE_Y_OFFSET = 200;   // جایی که می‌خوای مسیر شروع بشه
  const BRIDGE_MIN_Y = BRIDGE_Y_OFFSET + 20;
  const BRIDGE_MAX_Y = BRIDGE_Y_OFFSET + DESIRED_BRIDGE_HEIGHT - 60;
  // --- مرزهای افقی برای نیروها ---
  const MIN_X = 210; // جلوی پایگاه بازیکن
  const MAX_X = 1200 - 260; // جلوی پایگاه دشمن (عرض کانواس = 1200)

  const canvasWidthRef = useRef(1200); // مقدار پیش‌فرض = عرض canvas

  // لود تصاویر در ابتدا
  useEffect(() => {
    const loadBackgrounds = async () => {
      const bgImg = new Image();
      const playerBaseImg = new Image();
      const enemyBaseImg = new Image();

      bgImg.src = placeholder;
      playerBaseImg.src = placeholder;
      enemyBaseImg.src = placeholder;

      await Promise.all([
        new Promise(r => bgImg.onload = r),
        new Promise(r => playerBaseImg.onload = r),
        new Promise(r => enemyBaseImg.onload = r),
      ]);

      imageCacheRef.current.background = bgImg;
      imageCacheRef.current.playerBase = playerBaseImg;
      imageCacheRef.current.enemyBase = enemyBaseImg;
    };

    loadBackgrounds();

    // لود تصاویر نیروها
    preloadImages().then((images) => {
      let index = 0;
      Object.values(CARD_DEFS).forEach((card) => {
        const anims = {};
        Object.keys(card.animations).forEach(animType => {
          anims[animType] = card.animations[animType].map(() => images[index++]);
        });
        imageCacheRef.current[card.id] = anims;
      });
    });
  }, []);
  const getBridgeVerticalBounds = () => {
    return {
      min: BRIDGE_Y_OFFSET + 20,
      max: BRIDGE_Y_OFFSET + DESIRED_BRIDGE_HEIGHT - 60
    };
  };


const spawnUnit = (type, side = "player") => {
  const def = CARD_DEFS[type];
  if (!def) return;
  if (side === "player" && gold < def.cost_gold) return;
  if (side === "player") setGold((g) => g - def.cost_gold);

  const spawnX = side === "player" ? MIN_X : MAX_X;
  const { min: BRIDGE_MIN_Y, max: BRIDGE_MAX_Y } = getBridgeVerticalBounds();

  const newUnit = {
    ...def,
    instanceId: Math.random().toString(36).substr(2, 9),
    x: spawnX,
    y: BRIDGE_MIN_Y + Math.random() * (BRIDGE_MAX_Y - BRIDGE_MIN_Y),
    side,
    currentAnim: "walk",
    frameIndex: 0,
    frameTimer: 0,
    nextAttackTime: 0,
  };

  // 1. آپدیت ref اصلی
  unitsRef.current.push(newUnit);
  // 2. آپدیت state برای نمایش در UI
  setUnits([...unitsRef.current]);
  };


  // AI دشمن
  useEffect(() => {
    if (enemyBaseHp <= 0) return;
    const interval = setInterval(() => {
      const keys = Object.keys(CARD_DEFS);
      const randomType = keys[Math.floor(Math.random() * keys.length)];
      spawnUnit(randomType, "enemy");
    }, 5000);
    return () => clearInterval(interval);
  }, [enemyBaseHp]);

  // افزایش طلا
  useEffect(() => {
    const interval = setInterval(() => setGold((g) => g + 5), 1500);
    return () => clearInterval(interval);
  }, []);
  const lastTimeRef = useRef(0);
  const animationFrameRef = useRef(null);

// رندر Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!lastTimeRef.current) lastTimeRef.current = performance.now();

    let animationFrameId;

    const gameLoop = (timestamp) => {
      const deltaTime = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      // --- بخش ۱: آپدیت منطق بازی (Update) ---

      // آپدیت واحدها
      const updatedUnits = unitsRef.current
        .map((unit) => {
          // پیدا کردن هدف (منطق شما بدون تغییر)
          const enemies = unitsRef.current.filter((u) => {
            if (u.side === unit.side) return false;
            if (u.flying && unit.target_type === "ground") return false;
            if (!u.flying && unit.target_type === "air") return false;
            return true;
          });

          // ... (کدهای پیدا کردن target و محاسبه distance شما)
          let target;
          if (enemies.length > 0) {
            target = enemies.reduce((closest, e) => {
              const dx = e.x - unit.x;
              const dy = e.y - unit.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (!closest || dist < closest.dist) return { unit: e, dist };
              return closest;
            }, null).unit;
          } else {
            const playerBaseX = 0;
            const playerBaseY = BRIDGE_Y_OFFSET + DESIRED_BRIDGE_HEIGHT / 2 - 125 - 45;
            const enemyBaseX = canvas.width - 250;
            const enemyBaseY = playerBaseY;
            target = {
              x: unit.side === "player" ? enemyBaseX : playerBaseX + 200,
              y: unit.side === "player" ? enemyBaseY + 250 : playerBaseY + 250,
              isBase: true,
              side: unit.side === "player" ? "enemy" : "player",
            };
          }
          const dx = target.x - unit.x;
          const dy = target.y - unit.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // --- حمله ---
          if (distance <= unit.range) {
            if (timestamp >= unit.nextAttackTime) {
              unit.currentAnim = "attack";
              unit.frameIndex = 0;
              unit.frameTimer = 0;

              if (unit.id === "archer") {
                const projectileSpeed = 300;
                projectilesRef.current.push({
                  id: Math.random().toString(36).substr(2, 9),
                  x: unit.x + (unit.side === "player" ? 20 : -20),
                  y: unit.y,
                  vx: (dx / distance) * projectileSpeed,
                  vy: (dy / distance) * projectileSpeed,
                  damage: unit.damage,
                  targetSide: unit.side === "player" ? "enemy" : "player",
                });
              } else {
                if (target.isBase) {
                  if (unit.side === "player") {
                    setEnemyBaseHp((hp) => Math.max(0, hp - unit.damage));
                  } else {
                    setPlayerBaseHp((hp) => Math.max(0, hp - unit.damage));
                  }
                } else {
                  // آسیب رو مستقیم به واحد هدف در آرایه اعمال می‌کنیم
                  target.hp -= unit.damage;
                }
              }
              unit.nextAttackTime = timestamp + unit.attack_cooldown * 1000;

              setTimeout(() => {
                unit.currentAnim = "walk";
              }, 300);
            }
            return { ...unit };
          }

          // --- حرکت ---
          const speed = unit.speed;
          const vx = (dx / distance) * speed;
          const vy = (dy / distance) * speed;
          let newX = unit.x + vx;
          let newY = unit.y + vy;
          newX = Math.max(MIN_X, Math.min(MAX_X, newX));
          newY = Math.max(BRIDGE_MIN_Y, Math.min(BRIDGE_MAX_Y, newY));

          // دفع هم‌تیمی‌ها
          const teammates = unitsRef.current.filter(u => u.side === unit.side && u.instanceId !== unit.instanceId);
          teammates.forEach(teammate => {
            const tdx = newX - teammate.x;
            const tdy = newY - teammate.y;
            const tdist = Math.sqrt(tdx * tdx + tdy * tdy);
            if (tdist < 35) {
              const repelForce = (35 - tdist) / 35 * 0.2;
              newX += tdx * repelForce;
              newY += tdy * repelForce;
            }
          });
          newX = Math.max(MIN_X, Math.min(MAX_X, newX));
          newY = Math.max(BRIDGE_MIN_Y, Math.min(BRIDGE_MAX_Y, newY));

          return { ...unit, x: newX, y: newY };
        })
        .filter((u) => u.hp > 0);

      // آپدیت ref و state مربوط به واحدها
      unitsRef.current = updatedUnits;
      setUnits(updatedUnits);

      // آپدیت پرتابه‌ها
      const updatedProjectiles = projectilesRef.current
        .map((p) => {
          const dt = deltaTime;
          const newX = p.x + p.vx * dt;
          const newY = p.y + p.vy * dt;

          const hitUnit = unitsRef.current.find(
            (u) => u.side !== (p.targetSide === "enemy" ? "player" : "enemy") && Math.hypot(u.x - newX, u.y - newY) < 20
          );

          if (hitUnit) {
            hitUnit.hp -= p.damage;
            return null;
          }

          // ... (کدهای برخورد با پایگاه شما)
          const playerBaseX = 0;
          const playerBaseY = BRIDGE_Y_OFFSET + DESIRED_BRIDGE_HEIGHT / 2 - 125 - 45;
          const enemyBaseX = canvas.width - 250;
          const enemyBaseY = playerBaseY;
          const hitPlayerBase = p.targetSide === "player" && p.x > playerBaseX && p.x < playerBaseX + 250 && p.y > playerBaseY && p.y < playerBaseY + 250;
          const hitEnemyBase = p.targetSide === "enemy" && p.x > enemyBaseX && p.x < enemyBaseX + 250 && p.y > enemyBaseY && p.y < enemyBaseY + 250;

          if (hitPlayerBase || hitEnemyBase) {
            if (hitEnemyBase) setEnemyBaseHp((hp) => Math.max(0, hp - p.damage));
            else setPlayerBaseHp((hp) => Math.max(0, hp - p.damage));
            return null;
          }

          if (newX < -50 || newX > canvas.width + 50 || newY < -50 || newY > canvas.height + 50) return null;
          return { ...p, x: newX, y: newY };
        })
        .filter(Boolean);

      // آپدیت ref و state مربوط به پرتابه‌ها
      projectilesRef.current = updatedProjectiles;
      setProjectiles(updatedProjectiles);


      // --- بخش ۲: رندر کردن (Draw) ---

      // رندر پس‌زمینه
      const bgImg = imageCacheRef.current.background;
      if (bgImg) {
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = "#1a202c";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // ... (کدهای رندر پایگاه‌ها شما)
      const playerBaseImg = imageCacheRef.current.playerBase;
      const playerBaseWidth = 250;
      const playerBaseHeight = 250;
      const playerBaseX = 0;
      const playerBaseY = BRIDGE_Y_OFFSET + DESIRED_BRIDGE_HEIGHT / 2 - playerBaseHeight / 2 - 45;
      if (playerBaseImg) ctx.drawImage(playerBaseImg, playerBaseX, playerBaseY, playerBaseWidth, playerBaseHeight);
      else { ctx.fillStyle = "#22c55e"; ctx.fillRect(playerBaseX, playerBaseY, playerBaseWidth, playerBaseHeight); }
      ctx.fillStyle = "white"; ctx.font = "14px Arial"; ctx.fillText(`HP: ${playerBaseHp}`, playerBaseX, playerBaseY - 10);

      const enemyBaseImg = imageCacheRef.current.enemyBase;
      const enemyBaseWidth = 250;
      const enemyBaseHeight = 250;
      const enemyBaseX = canvas.width - enemyBaseWidth;
      const enemyBaseY = playerBaseY;
      if (enemyBaseImg) ctx.drawImage(enemyBaseImg, enemyBaseX, enemyBaseY, enemyBaseWidth, enemyBaseHeight);
      else { ctx.fillStyle = "#ef4444"; ctx.fillRect(enemyBaseX, enemyBaseY, enemyBaseWidth, enemyBaseHeight); }
      ctx.fillText(`HP: ${enemyBaseHp}`, enemyBaseX, enemyBaseY - 10);

      // رندر واحدها (از ref می‌خونیم)
      unitsRef.current.forEach((unit) => {
        const frameDelay = unit.currentAnim === "attack" ? 0.4 : 0.35;
        unit.frameTimer += deltaTime;
        if (unit.frameTimer >= frameDelay) {
          unit.frameTimer = 0;
          unit.frameIndex = (unit.frameIndex + 1) % unit.animations[unit.currentAnim].length;
        }

        const animCache = imageCacheRef.current[unit.id]?.[unit.currentAnim];
        let img = animCache ? animCache[unit.frameIndex] : null;
        if (!img) { const imgSrc = unit.animations[unit.currentAnim][unit.frameIndex]; img = new Image(); img.src = imgSrc; }

        const barWidth = 40; const barHeight = 5; const hpRatio = unit.hp / CARD_DEFS[unit.id].hp;

        if (unit.flying) {
          // ... (کدهای رندر واحد پرنده شما)
        } else {
          if (unit.side === "enemy") { ctx.save(); ctx.translate(unit.x + 40, unit.y); ctx.scale(-1, 1); ctx.drawImage(img, 0, 0, 40, 40); ctx.restore(); }
          else { ctx.drawImage(img, unit.x, unit.y, 40, 40); }
          ctx.fillStyle = "red"; ctx.fillRect(unit.x, unit.y - 10, barWidth, barHeight);
          ctx.fillStyle = "lime"; ctx.fillRect(unit.x, unit.y - 10, barWidth * hpRatio, barHeight);
        }
      });

      // رندر پرتابه‌ها (از ref می‌خونیم)
      projectilesRef.current.forEach((p) => {
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      lastTimeRef.current = 0;
    };
  }, []); // این آرایه خالی مهمه

  const CircularStat = ({ value, max, color, label }) => {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / max) * circumference;

    return (
      <div className="relative flex flex-col items-center mx-1">
        <svg width="70" height="70">
          <circle cx="35" cy="35" r={radius} stroke="#444" strokeWidth="6" fill="none" />
          <circle
            cx="35"
            cy="35"
            r={radius}
            stroke={color}
            strokeWidth="6"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 35 35)"
          />
        </svg>
        <span className="absolute text-white font-bold">{value}</span>
        <span className="text-xs text-gray-300 mt-1">{label}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-gray-900 overflow-hidden">
      <div className="w-full max-w-md p-2 bg-gray-900 fixed top-0 z-20 flex justify-around items-center shadow-lg">
        <CircularStat value={playerBaseHp} max={500} color="#22c55e" label="Player" />
        <CircularStat value={enemyBaseHp} max={500} color="#ef4444" label="Enemy" />
        <div className="flex flex-col w-24">
          <span className="text-xs text-gray-300">Gold: {gold}</span>
          <div className="flex w-full bg-gray-700 h-3 rounded-full mt-1">
            <div className="bg-yellow-400 h-3 rounded-full" style={{ width: `${Math.min(gold, 999) / 999 * 100}%` }} />
          </div>
          <span className="text-xs text-gray-300 mt-1">Food</span>
          <div className="w-full bg-gray-700 h-3 rounded-full mt-1">
            <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${Math.min(food, 100)}%` }} />
          </div>
        </div>
      </div>

      <div className="mt-20 flex overflow-x-auto overflow-y-hidden max-w-md snap-x snap-mandatory border border-gray-700 rounded-lg">
        <canvas ref={canvasRef} width={1200} height={500} className="block" />
      </div>

      <div className="fixed bottom-0 z-20 w-full max-w-md p-4 bg-gray-900 flex justify-around shadow-inner border-t-2 border-gray-700">
        {Object.entries(CARD_DEFS).map(([key, def]) => (
          <button
            key={key}
            onClick={() => spawnUnit(key, "player")}
            disabled={gold < def.cost_gold}
            className={`flex flex-col items-center rounded-lg shadow-lg p-2 transform transition ${
              gold < def.cost_gold
                ? "opacity-50 cursor-not-allowed"
                : "bg-gradient-to-b from-gray-800 to-gray-700 hover:scale-105"
            }`}
          >
            <img src={def.animations.walk[0]} alt={def.name} className="w-16 h-16 mb-1 border-2 border-gray-500 rounded-md" />
            <span className="text-white font-bold text-sm">{def.name}</span>
            <span className="text-yellow-400 font-semibold text-sm">{def.cost_gold}تومان</span>
          </button>
        ))}
      </div>
    </div>
  );
}

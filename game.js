/* Cambodia Royale 3D — offline-friendly prototype client.
   This is a playable visual demo, not a production multiplayer server. */
(() => {
  const $ = id => document.getElementById(id);
  const screens = ["authScreen","serverScreen","lobbyScreen","gameScreen"];
  let playerName = "", scene, camera, renderer, avatar, dragon, animId, mode = "lobby";
  let yaw = 0, hp = 100, alive = 60, dropped = false, moving = false, running = false;
  let weapons = ["ដាវ"], activeWeapon = 0, loot = 0, lastToast = 0;
  const accountsKey = "cr_accounts_v1";
  function show(id){ screens.forEach(s=>$(s).classList.toggle("hidden",s!==id)); }
  function getAccounts(){try{return JSON.parse(localStorage.getItem(accountsKey)||"{}")}catch(e){return {}}}
  function toast(msg){const el=$("lootToast");el.textContent=msg;el.classList.remove("hidden");lastToast=Date.now();setTimeout(()=>{if(Date.now()-lastToast>=1700)el.classList.add("hidden")},1750)}
  function enterServer(){show("serverScreen");$("accountBadge").textContent="♟ "+playerName;$("serverCount").textContent="1 / 500";$("serverMeter").style.width="0.2%"}
  $("createBtn").onclick=()=>{
    const u=$("username").value.trim(),p=$("password").value;
    if(u.length<3||p.length<4){alert("សូមបញ្ចូលឈ្មោះយ៉ាងតិច 3 តួ និងពាក្យសម្ងាត់យ៉ាងតិច 4 តួ");return}
    const a=getAccounts();if(a[u]){alert("ឈ្មោះនេះមានរួចហើយ។ សូមចូលគណនី ឬប្រើឈ្មោះផ្សេង។");return}
    a[u]=p;localStorage.setItem(accountsKey,JSON.stringify(a));playerName=u;enterServer();
  };
  $("loginBtn").onclick=()=>{
    const u=$("username").value.trim(),p=$("password").value,a=getAccounts();
    if(!a[u]||a[u]!==p){alert("រកគណនីមិនឃើញ ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ។ គំរូនេះរក្សាទុកតែក្នុង browser នេះ។");return}
    playerName=u;enterServer();
  };
  $("joinServerBtn").onclick=()=>{ $("lobbyName").textContent=playerName; show("lobbyScreen"); init3D("lobby"); };
  $("rotateLeft").onclick=()=>yaw-=Math.PI/6;
  $("rotateRight").onclick=()=>yaw+=Math.PI/6;
  $("startBtn").onclick=()=>{show("gameScreen");init3D("game");startMatch();};
  $("exitGame").onclick=()=>{mode="lobby";show("lobbyScreen");init3D("lobby")};

  function mat(color, roughness=0.85){return new THREE.MeshStandardMaterial({color,roughness})}
  function box(parent,x,y,z,sx,sy,sz,color){const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),mat(color));m.position.set(x,y,z);parent.add(m);return m}
  function addTemple(parent,x,z,scale=1){
    const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(scale);parent.add(g);
    const stone=mat(0x82796a),dark=mat(0x514b43),gold=mat(0xb58c4c);
    const base=new THREE.Mesh(new THREE.BoxGeometry(7,0.7,5),stone);base.position.y=.35;g.add(base);
    for(let level=0;level<3;level++){
      const w=5.6-level*1.35,h=.85,d=3.9-level*.8;
      const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),stone);b.position.y=.95+level*.8;g.add(b);
      for(let i=0;i<5-level;i++){
        const col=new THREE.Mesh(new THREE.BoxGeometry(.42,1.4,.45),dark);col.position.set(-w*.42+i*(w*.21),1.6+level*.8,d*.42);g.add(col);
      }
    }
    for(let i=0;i<5;i++){const s=new THREE.Mesh(new THREE.CylinderGeometry(.08,.8,1.1,4),gold);s.position.set((i-2)*1.05,3.1,0);g.add(s)}
    const roof=new THREE.Mesh(new THREE.ConeGeometry(1.4,2,4),dark);roof.position.y=4.1;g.add(roof);
    return g;
  }
  function buildAvatar(parent){
    const g=new THREE.Group();parent.add(g);
    const skin=mat(0xc58b63),shirt=mat(0x273c54),pants=mat(0x202733),boots=mat(0x11151b),gold=mat(0xb9924e);
    const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.36,.72,4,8),shirt);torso.position.y=1.35;g.add(torso);
    const head=new THREE.Mesh(new THREE.SphereGeometry(.27,16,12),skin);head.position.y=2.12;g.add(head);
    const hair=new THREE.Mesh(new THREE.SphereGeometry(.28,12,8,0,Math.PI*2,0,Math.PI/2),mat(0x241b17));hair.position.y=2.22;g.add(hair);
    for(const s of [-1,1]){
      const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.13,.58,3,7),pants);leg.position.set(s*.19,.55,0);g.add(leg);
      const foot=new THREE.Mesh(new THREE.BoxGeometry(.24,.16,.36),boots);foot.position.set(s*.19,.16,.08);g.add(foot);
      const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.12,.55,3,7),skin);arm.position.set(s*.47,1.43,0);arm.rotation.z=s*-.16;g.add(arm);
      const pad=new THREE.Mesh(new THREE.BoxGeometry(.28,.19,.27),gold);pad.position.set(s*.4,1.72,0);g.add(pad);
    }
    const belt=new THREE.Mesh(new THREE.BoxGeometry(.65,.13,.4),gold);belt.position.y=1.05;g.add(belt);
    return g;
  }
  function init3D(which){
    mode=which;
    if(animId)cancelAnimationFrame(animId);
    const host=$(which==="lobby"?"lobbyCanvas":"gameCanvas");host.innerHTML="";
    scene=new THREE.Scene();scene.background=new THREE.Color(which==="lobby"?0x9bc3d8:0x94b6c5);scene.fog=new THREE.Fog(0x9bc3d8,45,160);
    camera=new THREE.PerspectiveCamera(58,host.clientWidth/Math.max(1,host.clientHeight),.1,400);
    renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));renderer.setSize(host.clientWidth,host.clientHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;host.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xd8edff,0x62533a,2.1));
    const sun=new THREE.DirectionalLight(0xffe2af,3);sun.position.set(-25,45,20);sun.castShadow=true;scene.add(sun);
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(360,360),mat(which==="lobby"?0x687b4a:0x61744a));ground.rotation.x=-Math.PI/2;ground.position.y=-.08;ground.receiveShadow=true;scene.add(ground);
    // Water and rice-field-like landscape
    const water=new THREE.Mesh(new THREE.PlaneGeometry(90,18),new THREE.MeshStandardMaterial({color:0x4f9da9,roughness:.28,metalness:.15}));water.rotation.x=-Math.PI/2;water.position.set(0,.01,-22);scene.add(water);
    for(let i=0;i<18;i++){
      const x=(Math.random()-.5)*110,z=-15-Math.random()*75;
      const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.15,.24,2.4,6),mat(0x59452c));trunk.position.set(x,1.2,z);scene.add(trunk);
      const crown=new THREE.Mesh(new THREE.ConeGeometry(1.5,4,7),mat(i%2?0x355c3c:0x456c40));crown.position.set(x,3.7,z);scene.add(crown);
    }
    // Angkor-inspired central temple and surrounding houses
    addTemple(scene,0,-15,which==="lobby"?2.5:1.8);
    for(let i=0;i<10;i++){
      const x=(i%5-2)*9+(Math.random()-.5)*2,z=-3-Math.floor(i/5)*10;
      const house=new THREE.Group();house.position.set(x,0,z);scene.add(house);
      box(house,0,.75,0,3.2,1.5,2.5,0x9b8060);box(house,0,1.8,0,3.7,.35,2.9,0x51453a);
      const roof=new THREE.Mesh(new THREE.ConeGeometry(2.5,1.6,4),mat(0x72523b));roof.rotation.y=Math.PI/4;roof.position.y=2.7;house.add(roof);
      box(house,0,.6,1.27,.65,1.1,.06,0x392f27);
    }
    avatar=buildAvatar(scene);avatar.position.set(which==="lobby"?0:0,0,which==="lobby"?2:4);
    if(which==="lobby"){camera.position.set(5,3.5,9);camera.lookAt(0,1.5,0);$("touchControls").classList.add("hidden");$("dropControls").classList.add("hidden")}
    else{
      camera.position.set(0,7,15);camera.lookAt(0,0,-7);
      // Decorative dragon carrying the player toward the drop zone
      dragon=new THREE.Group();scene.add(dragon);
      const body=new THREE.Mesh(new THREE.CapsuleGeometry(.7,4,5,10),mat(0x253d51));body.rotation.z=Math.PI/2;body.position.y=5;dragon.add(body);
      const head=new THREE.Mesh(new THREE.ConeGeometry(.7,1.8,5),mat(0x3c6874));head.rotation.z=-Math.PI/2;head.position.set(2.6,5,0);dragon.add(head);
      for(const s of [-1,1]){const wing=new THREE.Mesh(new THREE.BoxGeometry(2.4,.12,3.5),mat(0x527b82));wing.position.set(0,5,s*2);wing.rotation.x=s*.15;dragon.add(wing)}
      dragon.position.set(0,0,15);
      $("touchControls").classList.add("hidden");$("dropControls").classList.remove("hidden");
    }
    let down=false,lastX=0;
    renderer.domElement.onpointerdown=e=>{down=true;lastX=e.clientX;renderer.domElement.setPointerCapture(e.pointerId)};
    renderer.domElement.onpointermove=e=>{if(down&&which==="lobby"){yaw+=(e.clientX-lastX)*.012;lastX=e.clientX}};
    renderer.domElement.onpointerup=()=>down=false;
    window.onresize=()=>{if(!renderer)return;camera.aspect=host.clientWidth/Math.max(1,host.clientHeight);camera.updateProjectionMatrix();renderer.setSize(host.clientWidth,host.clientHeight)};
    const clock=new THREE.Clock();
    function frame(){
      animId=requestAnimationFrame(frame);const t=clock.getElapsedTime();
      if(which==="lobby"){
        if(avatar){avatar.rotation.y=yaw;avatar.position.y=Math.sin(t*1.4)*.035}
        camera.lookAt(0,1.35,0);
      }else{
        if(!dropped&&dragon){dragon.position.z=15-t*1.7;dragon.position.y= Math.sin(t*1.4)*.4;avatar.position.set(dragon.position.x,dragon.position.y+4,dragon.position.z);avatar.rotation.y=Math.PI}
        else if(avatar){avatar.position.x+=moving?Math.sin(yaw)*.045:0;avatar.position.z+=moving?-Math.cos(yaw)*.045:0;avatar.rotation.y=yaw;if(running){avatar.position.x+=Math.sin(yaw)*.04;avatar.position.z-=Math.cos(yaw)*.04}}
        if(avatar){camera.position.x+=(avatar.position.x-camera.position.x)*.045;camera.position.z+=(avatar.position.z+10-camera.position.z)*.045;camera.position.y+=(avatar.position.y+6-camera.position.y)*.04;camera.lookAt(avatar.position.x,avatar.position.y+1,avatar.position.z-4)}
      }
      // Flying birds as small moving silhouettes
      for(const b of scene.userData.birds||[]){b.position.x=Math.sin(t*.25+b.userData.phase)*18;b.position.y=8+Math.sin(t*.8+b.userData.phase)*1.2;b.position.z=-10+Math.cos(t*.22+b.userData.phase)*12}
      renderer.render(scene,camera);
    }
    scene.userData.birds=[];
    for(let i=0;i<5;i++){const bird=new THREE.Group();const wing1=new THREE.Mesh(new THREE.BoxGeometry(.65,.04,.16),mat(0x303b3b));wing1.position.x=-.3;const wing2=wing1.clone();wing2.position.x=.3;bird.add(wing1,wing2);bird.userData.phase=i*1.7;scene.add(bird);scene.userData.birds.push(bird)}
    frame();
  }
  function startMatch(){
    hp=100;alive=60;dropped=false;weapons=["ដាវ"];activeWeapon=0;loot=0;
    $("hpText").textContent="100 / 100";$("hpBar").style.width="100%";$("aliveCount").textContent="60";
    $("phaseMessage").textContent="កំពុងរង់ចាំអ្នកលេង 60 នាក់…";
    $("touchControls").classList.add("hidden");$("dropControls").classList.remove("hidden");
    setTimeout(()=>{if(mode==="game"&&!dropped)$("phaseMessage").textContent="អ្នកលេង 60 នាក់កំពុងជិះនាគលើតំបន់សៀមរាប";},1000);
  }
  $("dropBtn").onclick=()=>{
    if(dropped)return;dropped=true; if(dragon){scene.remove(dragon);dragon=null}
    avatar.position.set(0,0,4);$("dropControls").classList.add("hidden");$("touchControls").classList.remove("hidden");
    $("phaseMessage").textContent="ចុះដល់ដី! ស្វែងរកអាវុធ និងរស់ឲ្យដល់ចុងក្រោយ";
    toast("អ្នកបានចុះពីនាគហើយ — ស្វែងរកផ្ទះដើម្បីរើសអាវុធ");
  };
  // Touch joystick, with pointer events so it works on Android screens.
  const joy=$("joystick"),stick=$("stick");let joyId=null;
  joy.onpointerdown=e=>{joyId=e.pointerId;joy.setPointerCapture(joyId);moveStick(e)};
  joy.onpointermove=e=>{if(joyId===e.pointerId)moveStick(e)};
  function moveStick(e){const r=joy.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=e.clientX-cx,dy=e.clientY-cy;const len=Math.hypot(dx,dy),max=34;if(len>max){dx=dx/len*max;dy=dy/len*max}stick.style.transform=`translate(${dx}px,${dy}px)`;moving=Math.hypot(dx,dy)>8;yaw=Math.atan2(dx,-dy)}
  function releaseStick(){joyId=null;stick.style.transform="translate(0,0)";moving=false}
  joy.onpointerup=releaseStick;joy.onpointercancel=releaseStick;
  $("runBtn").onpointerdown=()=>running=true;$("runBtn").onpointerup=()=>running=false;$("runBtn").onpointercancel=()=>running=false;
  $("attackBtn").onclick=()=>{
    if(!dropped){toast("សូមចុះពីនាគជាមុន");return}
    toast(weapons[activeWeapon]+"៖ វាយប្រហារ! (ការប្រយុទ្ធនេះជាការសាកល្បង)");
    alive=Math.max(1,alive-1);$("aliveCount").textContent=alive;
    if(alive===1){$("phaseMessage").textContent="🏆 អ្នកឈ្នះ! អ្នកជាអ្នករស់រានចុងក្រោយ";}
  };
  $("lootBtn").onclick=()=>{
    if(!dropped){toast("ចុះពីនាគសិន ទើបអាចរើសអាវុធបាន");return}
    const options=["ដាវមួយគូ","ដំបង","កាំបិត","ព្រួញ","ស្នា","កាំភ្លើងសាកល្បង"];
    const w=options[loot++%options.length];
    if(weapons.length>=2){const replace=confirm("កាបូបពេញ 2 អាវុធ។ ចុច OK ដើម្បីបោះចោលអាវុធទី 1 ហើយយក "+w+" ឬ Cancel ដើម្បីទុកដដែល");if(!replace)return;weapons[0]=w}
    else weapons.push(w);
    renderSlots();toast("រើសបាន៖ "+w+" • អាវុធអតិបរមា 2");
  };
  function renderSlots(){const box=$("weaponSlots");box.innerHTML="";weapons.forEach((w,i)=>{const b=document.createElement("button");b.className="slot"+(i===activeWeapon?" selected":"");b.textContent=w;b.onclick=()=>{activeWeapon=i;renderSlots()};box.appendChild(b)})}
  $("switchWeapon").onclick=()=>{if(weapons.length>1){activeWeapon=(activeWeapon+1)%weapons.length;renderSlots();toast("បានប្ដូរទៅ "+weapons[activeWeapon])}};
  // Keyboard support for desktop testing
  document.addEventListener("keydown",e=>{if(e.key==="ArrowLeft")yaw-=.1;if(e.key==="ArrowRight")yaw+=.1;if(e.key===" "&&mode==="game"&&!dropped)$("dropBtn").click();if(e.key.toLowerCase()==="e"&&mode==="game")$("lootBtn").click()});
  // If Three.js cannot load (offline), present a clear hint rather than a blank page.
  if(typeof THREE==="undefined"){document.querySelectorAll(".canvas").forEach(el=>el.innerHTML='<div style="padding:25vh 20px;text-align:center;color:white">ត្រូវការអ៊ីនធឺណិតដើម្បីផ្ទុក Three.js។ សូមបើកអ៊ីនធឺណិត ហើយ refresh។</div>')}
})();
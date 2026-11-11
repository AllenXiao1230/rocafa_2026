function createAjtScene(canvas, exhaustCanvas) {
  const pageColors = getComputedStyle(document.documentElement);
  const night = pageColors.getPropertyValue('--bg-deep').trim() || '#080f1d';
  const navy = pageColors.getPropertyValue('--bg-navy').trim() || '#111c30';
  const light = pageColors.getPropertyValue('--glow-hero').trim() || 'rgba(71,101,163,.22)';
  // =========================================================================
  // AIDC T-5 Brave Eagle (AJT 勇鷹高教機) Colored Vector Line-Art Animation
  // Runway 36 threshold to the north, with a rear chase camera.
  // =========================================================================

  const state = {
    progress: 0,
    styleMode: 'ink',

    pitchDeg: 0,
    altitudeFt: 0,
    distanceM: 0,
    gearDeploy: 1.0,
    elevatorDeflect: 0.0,
    flapDeploy: 1.0,
    wheelSpin: 0,
    rollOsc: 0
  };

  // Authentic AIDC T-5 Brave Eagle Livery Palette + Clean Technical Ink Environment
  const THEMES = {
    ink: {
      name: '勇鷹塗裝線條',
      skyTop: night,
      skyBottom: navy,
      groundFill: night,
      rwyFill: navy,
      gridLine: 'rgba(225, 191, 136, 0.13)',
      horizonLine: 'rgba(225, 191, 136, 0.38)',
      rwyStroke: '#bb9c6e',
      rwyMarking: '#edd6ad',
      occludeFill: '#f3f5f5',
      primaryLine: '#101a2b',
      secondaryLine: '#273955',
      detailLine: 'rgba(22, 37, 62, 0.33)',
      accentLine: '#ad222c',
      // T-5 Brave Eagle Livery Colors
      ajtWhiteTop: '#efe9dc',
      ajtWhiteSide: '#dddcd4',
      ajtBellyGray: '#a9b3b9',
      ajtRed: '#c92337',
      ajtRedDark: '#a3192b',
      ajtBlue: '#1b4d80',
      ajtBlueDark: '#112d53',
      ajtCanopyGlass: '#18354d',
      ajtCanopyHighlight: '#557f9c',
      ajtRadome: '#151e2c',
      ajtNozzleOuter: '#6e7884',
      ajtNozzleInner: '#141d2a',
      runwayLight: '#f5cf86',
      ajtTire: '#1e293b',
      ajtHub: '#cbd5e1',
      vortexLine: 'rgba(186, 207, 234, 0.38)'
    }
  };

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }
  function lerp(a, b, t) {
    return a + (b - a) * clamp(t, 0, 1);
  }
  function smoothstep(edge0, edge1, x) {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  }

  function updateKinematics(p) {
    state.distanceM = Math.round(1450 * Math.pow(p, 1.65));

    // Smooth pitch-up rotation starting around Vr (p = 0.43)
    if (p < 0.43) {
      state.pitchDeg = 0;
    } else if (p < 0.70) {
      const t = smoothstep(0.43, 0.68, p);
      state.pitchDeg = lerp(0, 11.2, t);
    } else {
      const t = smoothstep(0.70, 0.94, p);
      state.pitchDeg = lerp(11.2, 14.5, t);
    }

    // All-moving horizontal tailplane deflection during rotation
    const rotPull = smoothstep(0.39, 0.50, p) - 0.38 * smoothstep(0.68, 0.86, p);
    state.elevatorDeflect = clamp(rotPull, 0, 1);

    // Altitude above runway (feet)
    if (p < 0.65) {
      state.altitudeFt = 0;
    } else {
      const t = (p - 0.65) / 0.35;
      state.altitudeFt = 475 * Math.pow(t, 1.94);
    }

    // Tricycle landing gear retraction after liftoff
    state.gearDeploy = 1.0 - smoothstep(0.72, 0.91, p);
    state.flapDeploy = 1.0 - 0.4 * smoothstep(0.82, 0.98, p);

    if (p > 0.67) {
      state.rollOsc = Math.sin(p * 24) * 1.3 * smoothstep(0.67, 0.80, p) + 3.8 * smoothstep(0.84, 1, p);
    } else {
      state.rollOsc = 0;
    }

    state.wheelSpin = (state.distanceM * 1.8) % (Math.PI * 2);
  }

  // =========================================================================
  // 3D Coordinate Transformations & Camera Projection
  // =========================================================================
  function aircraftToWorld(lx, ly, lz, acPos, pitchRad, rollRad) {
    const cosR = Math.cos(rollRad);
    const sinR = Math.sin(rollRad);
    const x1 = lx * cosR - ly * sinR;
    const y1 = lx * sinR + ly * cosR;
    const z1 = lz;

    const cosP = Math.cos(pitchRad);
    const sinP = Math.sin(pitchRad);
    const x2 = x1;
    const y2 = y1 * cosP + z1 * sinP;
    const z2 = -y1 * sinP + z1 * cosP;

    return {
      x: x2 + acPos.x,
      y: y2 + acPos.y,
      z: z2 + acPos.z
    };
  }

  function worldToCamera(pt, cam) {
    const dx = pt.x - cam.x;
    const dy = pt.y - cam.y;
    const dz = pt.z - cam.z;

    const cosY = Math.cos(cam.yaw);
    const sinY = Math.sin(cam.yaw);
    const rx = dx * cosY - dz * sinY;
    const rz1 = dx * sinY + dz * cosY;

    const cosP = Math.cos(cam.pitch);
    const sinP = Math.sin(cam.pitch);
    const ry = dy * cosP - rz1 * sinP;
    const rz = dy * sinP + rz1 * cosP;

    return { cx: rx, cy: ry, cz: rz };
  }

  function projectPoint(pt, cam, width, height) {
    const c = worldToCamera(pt, cam);
    if (c.cz <= 0.25) return null;
    const scale = cam.fov / c.cz;
    return {
      sx: width * 0.5 + c.cx * scale,
      sy: height * 0.52 - c.cy * scale,
      depth: c.cz,
      cz: c.cz,
      scale: scale,
      cx: c.cx,
      cy: c.cy
    };
  }

  function screenSignedArea(scrPts) {
    let area = 0;
    const n = scrPts.length;
    for (let i = 0; i < n; i++) {
      const p1 = scrPts[i];
      const p2 = scrPts[(i + 1) % n];
      area += (p1.sx * p2.sy - p2.sx * p1.sy);
    }
    return area * 0.5;
  }

  const finStations = [
    { y: .36, zL: -.10, zT: -3.78, th: .095 },
    { y: .72, zL: -1.25, zT: -3.76, th: .082 },
    { y: 1.25, zL: -1.82, zT: -3.74, th: .068 },
    { y: 1.78, zL: -2.32, zT: -3.72, th: .056 },
    { y: 2.32, zL: -2.80, zT: -3.70, th: .044 },
    { y: 2.58, zL: -3.04, zT: -3.68, th: .032 },
    { y: 2.66, zL: -3.18, zT: -3.64, th: .018 },
  ];

  const wingtipRail = { span: 4.50, height: .03, aft: -2.75 };

  function wingtipWakePoint(side, t, phase, strength) {
    const angle = t * 12 - phase;
    const radius = t * .28 * strength;
    return {
      x: side * wingtipRail.span + Math.cos(angle) * radius,
      y: wingtipRail.height + Math.sin(angle) * radius,
      z: wingtipRail.aft - t * 5.8,
    };
  }

  // Chord/span trace of the close-up reference. The filled wing follows the rudder edge.
  const finTrim = [[.002, .015], [.178, .015], [.038, .37], [.002, .47]];
  const finRed = [[.002, .015], [.097, .015], [.023, .32], [.002, .44]];
  const eagleWing = [
    [.305, .441], [.437, .448], [.510, .540], [.557, .693], [.666, .875], [.903, .981],
    [.961, .960], [.896, .831], [.980, .898], [.995, .765], [.929, .728], [.995, .743],
    [.989, .663], [.946, .623], [.995, .657], [.990, .570], [.942, .530], [.995, .557],
    [.987, .470], [.955, .424], [.994, .457], [.984, .370], [.952, .331], [.977, .355],
    [.955, .267], [.959, .203], [.914, .184], [.819, .225], [.697, .284], [.534, .366], [.440, .399],
  ];
  const eagleNeck = [
    [.111, .421], [.112, .456], [.161, .475], [.260, .457], [.392, .415], [.630, .305],
    [.838, .191], [.995, .066], [.995, .037], [.917, .071], [.779, .136], [.631, .221],
    [.447, .315], [.313, .386], [.207, .403], [.165, .392], [.175, .428], [.248, .421],
    [.306, .406], [.217, .439], [.159, .440],
  ];
  const eagleFeathers = [
    [[.267, .472], [.165, .503], [.125, .555], [.094, .663], [.009, .841], [.179, .749], [.229, .657], [.217, .600], [.272, .682], [.285, .789], [.202, .863], [.347, .817], [.394, .738], [.398, .668], [.368, .574]],
    [[.304, .497], [.335, .563], [.440, .638], [.515, .716], [.494, .813], [.600, .747], [.627, .651], [.557, .573], [.478, .536], [.425, .482]],
    [[.258, .499], [.183, .540], [.117, .596], [.062, .680], [.031, .781], [.122, .701], [.223, .628], [.247, .547]],
    [[.327, .443], [.411, .487], [.485, .586], [.521, .745], [.600, .881], [.793, .975]],
  ];
  const eagleWingCut = [[.540, .402], [.585, .449], [.633, .581], [.663, .733], [.743, .870]];
  const tailSerial = [
    [[.12, .8], [.44, 1], [.44, 0]],
    [[.12, .8], [.44, 1], [.44, 0]],
    [[0, .82], [.16, 1], [.65, 1], [.82, .81], [.78, .62], [0, .16], [0, 0], [.84, 0]],
    [[0, .82], [.16, 1], [.65, 1], [.82, .81], [.78, .62], [0, .16], [0, 0], [.84, 0]],
  ];

  function projectFinMarking(u, v, side, acPos, pitch, roll, cam, width, height) {
    const y = lerp(finStations[1].y, finStations.at(-2).y, v);
    const end = finStations.findIndex(station => station.y >= y);
    const a = finStations[end - 1];
    const b = finStations[end];
    const t = (y - a.y) / (b.y - a.y);
    const z = lerp(lerp(a.zL, b.zL, t), lerp(a.zT, b.zT, t), u);
    const profile = u < .38 ? u / .38 : u < .76 ? lerp(1, .55, (u - .38) / .38) : lerp(.55, 0, (u - .76) / .24);
    const x = side * (lerp(a.th, b.th, t) * profile + .002);
    return projectPoint(aircraftToWorld(x, y, z, acPos, pitch, roll), cam, width, height);
  }

  function drawFinMarkings(acPos, pitch, roll, cam, width, height, theme) {
    const side = Math.sign(cam.x - acPos.x) || 1;
    const project = ([u, v]) => projectFinMarking(u, v, side, acPos, pitch, roll, cam, width, height);
    const paint = (points, color, filled, strokeWidth = 0) => {
      const projected = points.map(project);
      if (!projected.every(Boolean)) return;
      ctx.beginPath();
      projected.forEach(({ sx, sy }, index) => {
        if (index === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      });
      if (filled) {
        ctx.fillStyle = color;
        ctx.fill();
      } else {
        ctx.strokeStyle = color;
        ctx.lineWidth = strokeWidth;
        ctx.stroke();
      }
    };

    const scale = clamp(Math.min(width, height) / 740, .7, 2.2);
    ctx.save();
    paint(finTrim, theme.ajtWhiteTop, true);
    paint(finRed, theme.ajtRed, true);
    paint(eagleWing, '#d4d6d2', true);
    paint(eagleNeck, theme.ajtWhiteTop, true);
    for (const feather of eagleFeathers) paint(feather, theme.ajtWhiteTop, false, 1.45 * scale);
    paint(eagleWingCut, theme.ajtBlueDark, false, 1.1 * scale);
    for (let index = 0; index < tailSerial.length; index += 1) {
      const glyph = tailSerial[index].map(([u, v]) => {
        const chord = index * .092 + u * .073;
        return [side > 0 ? .55 - chord : .18 + chord, .105 + v * .08];
      });
      paint(glyph, theme.ajtWhiteTop, false, 1.1 * scale);
    }
    ctx.restore();
  }

  // =========================================================================
  // Authentic AIDC T-5 Brave Eagle (勇鷹高教機) 3D Mesh + Red-White-Blue Livery
  // Key Real-Aircraft Proportions (Rear View):
  // 1. Mid-mounted supercritical swept wings (y = +0.20m) with blended LERX
  // 2. Sculpted twin F124 engine nacelles (x = ±0.32m) with central tailcone spine
  // 3. Flared horizontal tailplane actuator fairings (x = ±0.66m, y = 0.0m)
  // 4. Elevated tandem stadium bubble canopy (tinted glass + internal frames)
  // 5. Tall swept vertical stabilizer with dorsal fin fillet, RWR bullet tip pod,
  //    and signature Red & Blue swept Brave Eagle livery stripes!
  // =========================================================================
  function buildAJTRenderables(state, acPos, pitchRad, rollRad, cam, width, height, theme) {
    const faces = [];
    const segments = [];

    const elevAngle = -state.elevatorDeflect * 0.30;
    const flapAngle = state.flapDeploy * 0.34;
    const gear = state.gearDeploy;

    function vtx(lx, ly, lz) {
      const wp = aircraftToWorld(lx, ly, lz, acPos, pitchRad, rollRad);
      return projectPoint(wp, cam, width, height);
    }

    function emitFace(localPts, edges = [], fillColor = theme.occludeFill, depthBias = 0) {
      const scrPts = localPts.map(p => vtx(p.x, p.y, p.z));
      if (!scrPts.every(Boolean)) return;
      const avgDepth = scrPts.reduce((s, p) => s + p.depth, 0) / scrPts.length + depthBias;
      faces.push({
        type: 'face',
        scrPts,
        edges,
        fillColor,
        depth: avgDepth
      });
    }

    function emitPolyline3D(localPts, style = 'primary', closed = false, depthBias = -0.02) {
      const n = closed ? localPts.length : localPts.length - 1;
      for (let i = 0; i < n; i++) {
        const a = localPts[i];
        const b = localPts[(i + 1) % localPts.length];
        const pa = vtx(a.x, a.y, a.z);
        const pb = vtx(b.x, b.y, b.z);
        if (!pa || !pb) continue;
        segments.push({
          type: 'segment',
          pa,
          pb,
          style,
          depth: (pa.depth + pb.depth) * 0.5 + depthBias
        });
      }
    }

    // Loft a surface with automatic silhouette edge detection AND per-quad livery color resolver
    function emitLoftedSurface(rings, options = {}) {
      const {
        closedRing = true,
        capStart = false,
        capEnd = false,
        capStartColor = theme.occludeFill,
        capEndColor = theme.occludeFill,
        ringCreases = {},
        longitudinalCreases = {},
        colorFn = null, // (s, i) => hex color string
        cullBack = false,
        depthBias = 0
      } = options;

      const numStations = rings.length;
      const numPts = rings[0].length;
      const scrGrid = rings.map(ring => ring.map(p => vtx(p.x, p.y, p.z)));

      const iLimit = closedRing ? numPts : numPts - 1;
      const quadFront = [];
      const quadValid = [];

      for (let s = 0; s < numStations - 1; s++) {
        quadFront[s] = [];
        quadValid[s] = [];
        for (let i = 0; i < iLimit; i++) {
          const ni = (i + 1) % numPts;
          const p0 = scrGrid[s][i];
          const p1 = scrGrid[s][ni];
          const p2 = scrGrid[s + 1][ni];
          const p3 = scrGrid[s + 1][i];
          if (!p0 || !p1 || !p2 || !p3) {
            quadValid[s][i] = false;
            quadFront[s][i] = false;
            continue;
          }
          quadValid[s][i] = true;
          const winding = screenSignedArea([p0, p1, p2, p3]);
          quadFront[s][i] = cullBack ? winding > 0 : winding < 0;
        }
      }

      for (let s = 0; s < numStations - 1; s++) {
        for (let i = 0; i < iLimit; i++) {
          if (!quadValid[s][i]) continue;
          const ni = (i + 1) % numPts;
          const p0 = scrGrid[s][i];
          const p1 = scrGrid[s][ni];
          const p2 = scrGrid[s + 1][ni];
          const p3 = scrGrid[s + 1][i];
          const isFront = quadFront[s][i];
          if (cullBack && !isFront) continue;

          const fillColor = colorFn ? colorFn(s, i, isFront) : theme.occludeFill;
          const edges = [];

          // Longitudinal edge 3 (p3 -> p0, along index i)
          const prevI = (i - 1 + numPts) % numPts;
          const hasPrev = closedRing || i > 0;
          const prevFront = hasPrev && quadValid[s][prevI] ? quadFront[s][prevI] : !isFront;
          const prevColor = (hasPrev && colorFn) ? colorFn(s, prevI, prevFront) : fillColor;

          if (isFront !== prevFront) {
            edges.push({ i0: 3, i1: 0, style: 'primary' });
          } else if (isFront && longitudinalCreases[i]) {
            edges.push({ i0: 3, i1: 0, style: longitudinalCreases[i] });
          } else if (isFront && fillColor !== prevColor) {
            // Crisp livery boundary line!
            edges.push({ i0: 3, i1: 0, style: 'detail' });
          }

          if (!closedRing && i === iLimit - 1) {
            edges.push({ i0: 1, i1: 2, style: longitudinalCreases[ni] || 'primary' });
          }

          // Circumferential edge 0 (p0 -> p1, at station s)
          const prevSFront = (s > 0 && quadValid[s - 1][i]) ? quadFront[s - 1][i] : !isFront;
          const prevSColor = (s > 0 && colorFn) ? colorFn(s - 1, i, prevSFront) : fillColor;
          if (s === 0 && !capStart) {
            edges.push({ i0: 0, i1: 1, style: ringCreases[0] || 'primary' });
          } else if (isFront !== prevSFront) {
            edges.push({ i0: 0, i1: 1, style: 'primary' });
          } else if (isFront && ringCreases[s]) {
            edges.push({ i0: 0, i1: 1, style: ringCreases[s] });
          } else if (isFront && fillColor !== prevSColor) {
            edges.push({ i0: 0, i1: 1, style: 'detail' });
          }

          // Circumferential edge 2 (p2 -> p3, at station s + 1)
          if (s === numStations - 2 && !capEnd) {
            edges.push({ i0: 2, i1: 3, style: ringCreases[numStations - 1] || 'primary' });
          } else if (isFront && ringCreases[s + 1] && s === numStations - 2) {
            edges.push({ i0: 2, i1: 3, style: ringCreases[s + 1] });
          }

          const avgDepth = (p0.depth + p1.depth + p2.depth + p3.depth) * 0.25 + depthBias;
          faces.push({
            type: 'face',
            scrPts: [p0, p1, p2, p3],
            edges,
            fillColor,
            depth: avgDepth
          });
        }
      }

      if (capStart) {
        const capPts = scrGrid[0];
        if (capPts.every(Boolean)) {
          const avgDepth = capPts.reduce((a, b) => a + b.depth, 0) / capPts.length + depthBias;
          const edges = [];
          for (let i = 0; i < capPts.length; i++) {
            edges.push({ i0: i, i1: (i + 1) % capPts.length, style: ringCreases[0] || 'primary' });
          }
          faces.push({ type: 'face', scrPts: capPts, edges, fillColor: capStartColor, depth: avgDepth });
        }
      }
      if (capEnd) {
        const capPts = scrGrid[numStations - 1];
        if (capPts.every(Boolean)) {
          const avgDepth = capPts.reduce((a, b) => a + b.depth, 0) / capPts.length + depthBias;
          const edges = [];
          for (let i = 0; i < capPts.length; i++) {
            edges.push({ i0: i, i1: (i + 1) % capPts.length, style: ringCreases[numStations - 1] || 'primary' });
          }
          faces.push({ type: 'face', scrPts: capPts, edges, fillColor: capEndColor, depth: avgDepth });
        }
      }
    }

    // -----------------------------------------------------------------------
    // 1. REALISTIC AIDC T-5 BRAVE EAGLE FUSELAGE & CANOPY GEOMETRY + LIVERY
    // Sculpted twin-engine rear fuselage transitioning into mid-wing shoulder,
    // side intake ducts, raised stadium tandem canopy, and dark radome cone.
    // -----------------------------------------------------------------------
    const fuselageSpecs = [
      // Station 0..2: Twin-engine tail fairing & tailplane pivot shelves
      { z: -3.62, w: 0.68, deckH: 0.36, bellyH: -0.24, chineH: 0.02, groove: 0.24, canH: 0.00, canW: 0.26, sponson: 0.0 },
      { z: -3.00, w: 0.75, deckH: 0.45, bellyH: -0.29, chineH: 0.06, groove: 0.18, canH: 0.00, canW: 0.30, sponson: 0.0 },
      { z: -2.20, w: 0.82, deckH: 0.54, bellyH: -0.34, chineH: 0.12, groove: 0.10, canH: 0.00, canW: 0.35, sponson: 0.15 },
      // Station 3..5: Mid-wing root junction & main landing gear sponsons
      { z: -1.30, w: 0.88, deckH: 0.62, bellyH: -0.38, chineH: 0.18, groove: 0.04, canH: 0.00, canW: 0.40, sponson: 0.45 },
      { z: -0.35, w: 0.92, deckH: 0.68, bellyH: -0.40, chineH: 0.20, groove: 0.00, canH: 0.02, canW: 0.44, sponson: 0.65 },
      { z:  0.50, w: 0.90, deckH: 0.72, bellyH: -0.40, chineH: 0.20, groove: 0.00, canH: 0.16, canW: 0.45, sponson: 0.60 },
      // Station 6..9: Elevated Tandem Bubble Canopy & Side Air Intakes under LERX
    { z:  1.35, w: 0.86, deckH: 0.72, bellyH: -0.38, chineH: 0.19, groove: 0.00, canH: 0.48, canW: 0.43, sponson: 0.50 },
    { z:  2.30, w: 0.80, deckH: 0.70, bellyH: -0.36, chineH: 0.17, groove: 0.00, canH: 0.66, canW: 0.43, sponson: 0.35 },
    { z:  3.35, w: 0.71, deckH: 0.66, bellyH: -0.33, chineH: 0.14, groove: 0.00, canH: 0.57, canW: 0.39, sponson: 0.15 },
    { z:  4.35, w: 0.59, deckH: 0.59, bellyH: -0.28, chineH: 0.10, groove: 0.00, canH: 0.32, canW: 0.31, sponson: 0.0 },
      // Station 10..13: Forward cockpit coaming & dark gray/black radome nose cone
      { z:  5.30, w: 0.46, deckH: 0.47, bellyH: -0.23, chineH: 0.06, groove: 0.00, canH: 0.04, canW: 0.24, sponson: 0.0 },
      { z:  6.45, w: 0.32, deckH: 0.32, bellyH: -0.16, chineH: 0.02, groove: 0.00, canH: 0.00, canW: 0.16, sponson: 0.0 },
    { z:  7.72, w: 0.18, deckH: 0.14, bellyH: -0.09, chineH: 0.00, groove: 0.00, canH: 0.00, canW: 0.08, sponson: 0.0 },
    { z:  9.14, w: 0.015, deckH: 0.015, bellyH: -0.015, chineH: 0.00, groove: 0.00, canH: 0.00, canW: 0.01, sponson: 0.0 }
    ];

    const ringN = 24;
    const fuselageRings = fuselageSpecs.map(sp => {
      const ring = [];
      for (let i = 0; i < ringN; i++) {
        const theta = (i / ringN) * Math.PI * 2; // 0 at top center, clockwise
        const sinT = Math.sin(theta);
        const cosT = Math.cos(theta);
        const side = Math.sign(sinT);
        const absSin = Math.abs(sinT);

        let x, y;
        if (cosT >= 0) {
          if (sp.canH > 0.03 && cosT > 0.52) {
            // Teardrop stadium bubble canopy
            const canFrac = (cosT - 0.52) / 0.48;
            const arch = Math.sin(canFrac * Math.PI * 0.5);
          x = side * sp.canW * Math.sqrt(1 - canFrac * canFrac);
            y = sp.deckH + sp.canH * arch;
          } else {
            const shoulderFrac = sp.canH > 0.03 ? (cosT / 0.52) : cosT;
            x = side * lerp(sp.w, sp.canH > 0.03 ? sp.canW : 0.0, Math.pow(shoulderFrac, 0.84));
            y = lerp(sp.chineH, sp.deckH, Math.pow(shoulderFrac, 0.76));
          }
        } else {
          // Lower hemisphere: intake ducts & twin engine nacelles
          const botFrac = -cosT;
          const sponsonBulge = sp.sponson * 0.12 * Math.sin(botFrac * Math.PI) * absSin;
          x = side * (sp.w * Math.pow(absSin, 0.80) + sponsonBulge);
          const baseBelly = lerp(sp.chineH, sp.bellyH, Math.pow(botFrac, 0.70));
          const centerTuck = sp.groove * Math.pow(1 - absSin, 2.2) * botFrac;
          const lobeBulge = sp.groove * 0.42 * Math.sin(absSin * Math.PI) * botFrac;
          y = baseBelly + centerTuck - lobeBulge;
        }
        ring.push({ x, y, z: sp.z });
      }
      return ring;
    });

    // Fuselage Livery Color Resolver (Authentic T-5 Brave Eagle Red-White-Blue scheme)
    function fuselageColorFn(s, i) {
      const quadrant = Math.min(i, ringN - 1 - i);
      if (s >= 11) return quadrant < 5 ? theme.ajtRadome : quadrant === 5 ? theme.ajtWhiteTop : theme.ajtBlueDark;

      // Bubble Canopy Glass (stations 5..9, upper indices 0,1,2 and 21,22,23)
      if (s >= 5 && s <= 9 && quadrant <= 3) {
        return quadrant === 1 ? theme.ajtCanopyHighlight : theme.ajtCanopyGlass;
      }

      if (s === 0 && quadrant >= 5) return theme.ajtBellyGray;
      if (s === 1 && quadrant >= 3) return quadrant === 3 ? theme.ajtWhiteTop : theme.ajtRed;
      if (s === 2 && quadrant >= 2) return theme.ajtWhiteTop;
      if (s === 4 && quadrant >= 6) return theme.ajtRed;
      if (s === 5 && quadrant >= 6) return theme.ajtWhiteTop;
      if (quadrant <= 3) return s < 8 ? theme.ajtBlue : theme.ajtRadome;
      if (quadrant === 4) return theme.ajtBlue;
      if (quadrant < 8) return s >= 6 ? theme.ajtWhiteTop : theme.ajtWhiteSide;
      if (quadrant < 10) return theme.ajtBlueDark;
      if (s >= 7) return theme.ajtRedDark;
      return theme.ajtBellyGray;
    }

    emitLoftedSurface(fuselageRings, {
      closedRing: true,
      capStart: true,
      capEnd: false,
      capStartColor: theme.ajtBellyGray,
      colorFn: fuselageColorFn,
      ringCreases: {
        0: 'primary',
        5: 'secondary', // Rear canopy arch
        7: 'primary',   // Separate front and rear seats
        9: 'secondary', // Front windscreen frame
        11: 'primary'   // Radome nose cone line
      },
      longitudinalCreases: {
        3: 'secondary',  // Right canopy sill
        21: 'secondary', // Left canopy sill
        6: 'primary',    // Right chine / wing-body line
        18: 'primary'    // Left chine / wing-body line
      }
    });

    // Central Tailcone Speedbrake / Drag-Chute Fairing between the Twin Nozzles
    emitFace([
      { x: -0.09, y:  0.34, z: -3.62 },
      { x:  0.09, y:  0.34, z: -3.62 },
      { x:  0.06, y:  0.05, z: -3.96 },
      { x: -0.06, y:  0.05, z: -3.96 }
    ], [
      { i0: 0, i1: 1, style: 'secondary' },
      { i0: 1, i1: 2, style: 'primary' },
      { i0: 2, i1: 3, style: 'primary' },
      { i0: 3, i1: 0, style: 'primary' }
    ], theme.ajtWhiteSide, -0.04);

    // -----------------------------------------------------------------------
    // 2. TWIN F124 TURBOFAN EXHAUST NOZZLES (Metallic Gunmetal + Glowing Core)
    // -----------------------------------------------------------------------
    [-0.34, 0.34].forEach(nx => {
      const ny = 0.01;
      const nSegs = 20;
      const nozzleStations = [
        { z: -3.59, r: 0.285 },
        { z: -3.78, r: 0.278 },
        { z: -4.04, r: 0.236 }
      ];
      const nRings = nozzleStations.map(ns => {
        const r = [];
        for (let i = 0; i < nSegs; i++) {
          const a = (i / nSegs) * Math.PI * 2;
          r.push({
            x: nx + Math.sin(a) * ns.r,
            y: ny + Math.cos(a) * ns.r,
            z: ns.z
          });
        }
        return r;
      });

      emitLoftedSurface(nRings, {
        closedRing: true,
        capStart: false,
        capEnd: true,
        capEndColor: theme.ajtNozzleInner,
        colorFn: (s, i) => (s === 0 ? theme.ajtNozzleOuter : (i % 2 === 0 ? theme.ajtNozzleOuter : '#334155')),
        ringCreases: { 0: 'secondary', 1: 'detail', 2: 'primary' },
        longitudinalCreases: {
          0: 'detail', 2: 'detail', 4: 'detail', 6: 'detail', 8: 'detail',
          10: 'detail', 12: 'detail', 14: 'detail', 16: 'detail', 18: 'detail'
        },
        depthBias: -0.05
      });

      // Recessed exhaust opening.
      const nozzleCore = [];
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        nozzleCore.push({
          x: nx + Math.sin(a) * 0.165,
          y: ny + Math.cos(a) * 0.165,
          z: -4.05
        });
      }
      emitFace(
        nozzleCore,
        nozzleCore.map((_, idx) => ({ i0: idx, i1: (idx + 1) % nozzleCore.length, style: 'detail' })),
        '#090e17',
        -0.08
      );
    });

    // -----------------------------------------------------------------------
    // 3. MID-MOUNTED SWEPT WINGS + LERX + SLOTTED FLAPS + RED WINGTIP RAILS
    // Includes authentic T-5 Brave Eagle Red & Blue swept wing stripes!
    // -----------------------------------------------------------------------
    const leadingEdge = 7;
    function makeAirfoilRing(spanX, zLead, zTrail, yBase, thick, camber, [blueEdge, redFront, redBack]) {
      // Chord stations follow the navy, cream and red paint boundaries.
      const top = [1, lerp(redBack, 1, .72), lerp(redBack, 1, .38), redBack, redFront, blueEdge, blueEdge * .36, 0];
      const chord = [...top, ...top.slice(1, -1).reverse()];
      return chord.map((fraction, index) => {
        const curve = Math.sin(Math.PI * fraction);
        return {
          x: spanX,
          y: yBase + (camber + (index <= leadingEdge ? thick : -thick)) * curve,
          z: lerp(zLead, zTrail, fraction)
        };
      });
    }

    function wingPaint(_, index) {
      const top = index < leadingEdge;
      const band = top ? index : leadingEdge * 2 - 1 - index;
      if (band >= 5) return top ? theme.ajtBlueDark : theme.ajtBlue;
      if (band === 3) return top ? theme.ajtRed : theme.ajtRedDark;
      if (band === 2 || band === 4) return theme.ajtWhiteTop;
      return top ? theme.ajtWhiteSide : theme.ajtBellyGray;
    }

    function upperSkinHeight(x, z) {
      const next = fuselageSpecs.findIndex(station => station.z >= z);
      const previous = next - 1;
      const along = (z - fuselageSpecs[previous].z) / (fuselageSpecs[next].z - fuselageSpecs[previous].z);
      const a = fuselageRings[previous];
      const b = fuselageRings[next];
      const span = Math.abs(x);
      for (let i = 1; i <= ringN / 4; i += 1) {
        const outerX = lerp(a[i].x, b[i].x, along);
        if (span > outerX) continue;
        const innerX = lerp(a[i - 1].x, b[i - 1].x, along);
        const innerY = lerp(a[i - 1].y, b[i - 1].y, along);
        const outerY = lerp(a[i].y, b[i].y, along);
        return lerp(innerY, outerY, (span - innerX) / (outerX - innerX));
      }
      return lerp(fuselageSpecs[previous].chineH, fuselageSpecs[next].chineH, along);
    }

    function paintDorsalBands(wingRoot) {
      // These four seams are shared with the wing and meet across the spine behind the canopy.
      const spine = [-.82, -.55, .18, .42];
      const panelRows = [0, .12, .27, .46, .65, .83, 1];
      const rowAt = (inward, chord, across) => {
        const a = wingRoot[chord];
        const b = wingRoot[chord + 1];
        const x = lerp(a.x, 0, inward);
        const rootZ = lerp(a.z, b.z, across);
        const z = lerp(rootZ, lerp(spine[chord - 2], spine[chord - 1], across), inward);
        const rootY = lerp(a.y, b.y, across);
        const y = inward === 0 ? rootY : upperSkinHeight(x, z) + .015;
        return { x, y, z };
      };

      for (let chord = 2; chord <= 4; chord += 1) {
        const color = wingPaint(0, chord);
        for (let i = 1; i < panelRows.length; i += 1) {
          const inner = panelRows[i];
          const outer = panelRows[i - 1];
          for (let j = 0; j < 3; j += 1) {
            const from = j / 3;
            const to = (j + 1) / 3;
            emitFace([rowAt(outer, chord, from), rowAt(outer, chord, to), rowAt(inner, chord, to), rowAt(inner, chord, from)], [], color, -.58);
          }
        }
      }
    }

    [-1, 1].forEach(side => {
      // Mid-wing geometry (root at y = +0.20m with subtle -1.5° anhedral out to y = +0.04m at wingtip)
      const wingSpecs = [
        { x: side * 0.84, zL:  3.25, zT: -1.62, y: 0.20, th: 0.095, cam: 0.035 }, // 0: LERX root
        { x: side * 1.35, zL:  1.45, zT: -1.72, y: 0.18, th: 0.090, cam: 0.035 }, // 1: LERX / Wing junction
        { x: side * 2.05, zL:  0.22, zT: -1.85, y: 0.14, th: 0.080, cam: 0.030 }, // 2: Inboard wing
        { x: side * 2.75, zL: -0.32, zT: -1.98, y: 0.11, th: 0.070, cam: 0.025 }, // 3: Mid wing (Red stripe)
        { x: side * 3.65, zL: -0.90, zT: -2.15, y: 0.07, th: 0.058, cam: 0.018 }, // 4: Outboard (Blue stripe)
        { x: side * 4.47, zL: -1.54, zT: -2.29, y: 0.03, th: 0.044, cam: 0.010 }  // 5: Wingtip (Red flash)
      ];

      const wingBands = [[.465, .545, .79], [.255, .36, .65], [.20, .30, .57], [.23, .33, .59], [.34, .45, .73], [.48, .63, .92]];
      let wingRings = wingSpecs.map((ws, index) => makeAirfoilRing(ws.x, ws.zL, ws.zT, ws.y, ws.th, ws.cam, wingBands[index]));
      paintDorsalBands(wingRings[0]);
      if (side < 0) {
        wingRings = wingRings.slice().reverse();
      }

      emitLoftedSurface(wingRings, {
        closedRing: true,
        capStart: false,
        capEnd: false,
        cullBack: true,
        colorFn: wingPaint,
        ringCreases: {
          0: 'primary',
          1: 'detail',
          2: 'detail',
          3: 'detail',
          4: 'detail',
          5: 'primary'
        },
        longitudinalCreases: {
          0: 'primary', // Sharp trailing edge
          [leadingEdge]: 'primary'
        }
      });

      // The blue-and-white wing markings sit in the cream band just ahead of the red stripe.
      for (const face of [-1, 1]) {
        for (const [radius, color, layer] of [[.132, theme.ajtBlueDark, 0], [.082, theme.ajtWhiteTop, 1], [.033, theme.ajtBlue, 2]]) {
          const mark = Array.from({ length: 16 }, (_, index) => {
            const angle = index / 16 * Math.PI * 2;
            const x = 3.36 + Math.cos(angle) * radius;
            const t = (x - 2.75) / .9;
            const zLead = lerp(-.32, -.9, t);
            const zTrail = lerp(-1.98, -2.15, t);
            const z = lerp(zLead, zTrail, .37) + Math.sin(angle) * radius;
            const fraction = (z - zLead) / (zTrail - zLead);
            const y = lerp(.11, .07, t) + (lerp(.025, .018, t) + face * lerp(.07, .058, t)) * Math.sin(fraction * Math.PI);
            return { x: side * x, y: y + face * (.005 + layer * .003), z };
          });
          const projected = mark.map(({ x, y, z }) => vtx(x, y, z));
          if (projected.every(Boolean) && screenSignedArea(projected) * side * face < 0) {
            emitFace(mark, [], color, -layer * .004);
          }
        }
      }

      // Inboard slotted takeoff flap.
      const flapSpecs = [
        { x: side * 0.88, zL: -1.64, zT: -2.35, yL: 0.19, yT: 0.19 - flapAngle * 0.65 },
        { x: side * 1.80, zL: -1.80, zT: -2.45, yL: 0.15, yT: 0.15 - flapAngle * 0.65 },
        { x: side * 2.72, zL: -1.96, zT: -2.55, yL: 0.11, yT: 0.11 - flapAngle * 0.60 }
      ];
      let flapRings = flapSpecs.map(fs => [
        { x: fs.x, y: fs.yT, z: fs.zT },
        { x: fs.x, y: lerp(fs.yL, fs.yT, 0.45) + 0.03, z: lerp(fs.zL, fs.zT, 0.45) },
        { x: fs.x, y: fs.yL + 0.02, z: fs.zL },
        { x: fs.x, y: fs.yL - 0.02, z: fs.zL },
        { x: fs.x, y: lerp(fs.yL, fs.yT, 0.45) - 0.02, z: lerp(fs.zL, fs.zT, 0.45) }
      ]);
      if (side < 0) flapRings = flapRings.slice().reverse();

      emitLoftedSurface(flapRings, {
        closedRing: true,
        capStart: true,
        capEnd: true,
        capStartColor: theme.ajtWhiteSide,
        capEndColor: theme.ajtWhiteSide,
        colorFn: (_, index) => index < 2 ? theme.ajtWhiteTop : theme.ajtBellyGray,
        ringCreases: { 0: 'secondary', 1: 'detail', 2: 'secondary' },
        longitudinalCreases: { 0: 'primary', 2: 'secondary' }
      });

      // Outboard Aileron (x = 2.74 to 4.55)
      const ailSpecs = [
        { x: side * 2.74, zL: -1.98, zT: -2.42, y: 0.11 },
        { x: side * 4.55, zL: -2.30, zT: -2.64, y: 0.03 }
      ];
      let ailRings = ailSpecs.map(as => [
        { x: as.x, y: as.y - 0.02, z: as.zT },
        { x: as.x, y: as.y + 0.02, z: as.zL },
        { x: as.x, y: as.y - 0.02, z: as.zL }
      ]);
      if (side < 0) ailRings = ailRings.slice().reverse();

      emitLoftedSurface(ailRings, {
        closedRing: true,
        capStart: true,
        capEnd: true,
        colorFn: () => theme.ajtWhiteTop,
        ringCreases: { 0: 'secondary', 1: 'secondary' },
        longitudinalCreases: { 0: 'primary', 1: 'secondary' }
      });

      // Dark wingtip fittings continue the leading-edge paint.
      const railZ = [wingtipRail.aft, -2.45, -0.95, -0.52];
      const railRadii = [0.015, 0.055, 0.055, 0.01];
      const railRings = railZ.map((rz, idx) => {
        const rr = railRadii[idx];
        const cx = side * wingtipRail.span;
        const cy = wingtipRail.height;
        return [
          { x: cx,             y: cy + rr * 1.25, z: rz },
          { x: cx + side * rr, y: cy,             z: rz },
          { x: cx,             y: cy - rr * 1.25, z: rz },
          { x: cx - side * rr, y: cy,             z: rz }
        ];
      });
      emitLoftedSurface(railRings, {
        closedRing: true,
        capStart: true,
        capEnd: true,
        capStartColor: theme.ajtBlueDark,
        capEndColor: theme.ajtBlueDark,
        colorFn: () => theme.ajtBlueDark,
        ringCreases: { 0: 'primary', 3: 'primary' },
        longitudinalCreases: { 0: 'primary', 1: 'primary', 2: 'primary', 3: 'primary' }
      });
    });

    // -----------------------------------------------------------------------
    // 4. ALL-MOVING SWEPT HORIZONTAL STABILIZERS (With Red & Blue Tip Stripes)
    // Mounted at y = 0.00m with subtle anhedral (-3°)
    // -----------------------------------------------------------------------
    [-1, 1].forEach(side => {
      const pivZ = -2.95;
      const pivY = 0.00;
      function rotHStab(x, yOff, zOff) {
        const c = Math.cos(elevAngle);
        const s = Math.sin(elevAngle);
        return {
          x: side * x,
          y: pivY + yOff * c + zOff * s,
          z: pivZ - yOff * s + zOff * c
        };
      }

      const hSpecs = [
        { x: 0.74, zL:  0.46, zT: -0.82, y:  0.00, th: 0.044 },
        { x: 1.56, zL: -0.04, zT: -0.99, y: -0.05, th: 0.035 },
        { x: 2.38, zL: -0.54, zT: -1.16, y: -0.10, th: 0.022 }
      ];

      const tailBands = [[.25, .36, .63], [.31, .43, .73], [.45, .56, .87]];
      let hRings = hSpecs.map((hs, index) => makeAirfoilRing(hs.x, hs.zL, hs.zT, hs.y, hs.th, .012, tailBands[index])
        .map(point => rotHStab(point.x, point.y, point.z)));
      if (side < 0) hRings = hRings.slice().reverse();

      emitLoftedSurface(hRings, {
        closedRing: true,
        capStart: true,
        capEnd: true,
        capEndColor: theme.ajtBlueDark,
        cullBack: true,
        colorFn: wingPaint,
        ringCreases: { 0: 'primary', 2: 'secondary' },
        longitudinalCreases: { 0: 'primary', [leadingEdge]: 'primary' }
      });
    });

    // -----------------------------------------------------------------------
    // 5. Swept vertical stabilizer and dorsal fin.
    // -----------------------------------------------------------------------
    const vTailRings = finStations.map(vs => {
      const zMid = lerp(vs.zL, vs.zT, 0.38);
      const zRud = lerp(vs.zL, vs.zT, 0.76);
      return [
        { x:  0.00,         y: vs.y, z: vs.zT }, // 0: Trailing edge
        { x:  vs.th * 0.55, y: vs.y, z: zRud },  // 1: Right rudder hinge
        { x:  vs.th,        y: vs.y, z: zMid },  // 2: Right max thickness
        { x:  0.00,         y: vs.y, z: vs.zL }, // 3: Leading edge
        { x: -vs.th,        y: vs.y, z: zMid },  // 4: Left max thickness
        { x: -vs.th * 0.55, y: vs.y, z: zRud }   // 5: Left rudder hinge
      ];
    });

    emitLoftedSurface(vTailRings, {
      closedRing: true,
      capStart: false,
      capEnd: true,
      capEndColor: theme.ajtBlueDark,
      colorFn: (_, index) => index === 1 || index === 4 ? theme.ajtBlue : theme.ajtBlueDark,
      ringCreases: {
        0: 'secondary',
        5: 'secondary',
        6: 'primary'
      },
      longitudinalCreases: {
        0: 'primary',   // Trailing edge
        1: 'secondary', // Right rudder hinge
        3: 'primary',   // Swept leading edge
        5: 'secondary'  // Left rudder hinge
      }
    });

    // -----------------------------------------------------------------------
    // 6. WIDE-TRACK FUSELAGE-SPONSON TRICYCLE LANDING GEAR
    // Authentic T-5 / F-CK-1 outward-angled main gear struts + dark tires & alloy hubs
    // -----------------------------------------------------------------------
    if (gear > 0.04) {
      const foldAngle = (1 - gear) * (Math.PI * 0.48);
      const cosG = Math.cos(foldAngle);
      const sinG = Math.sin(foldAngle);

      [-1, 1].forEach(side => {
        // Main gear attaches at fuselage sponson (x = ±0.82) and angles outward to wide track (x = ±1.36)
        const attachX = side * 0.84;
        const attachY = -0.26;
        const attachZ = -0.62;

        const axleX = side * (0.84 + 0.52 * cosG) - side * 0.65 * sinG;
        const axleY = attachY - 0.88 * cosG;
        const axleZ = attachZ;

        // Subdivided Main Strut & Diagonal Drag Brace
        const strutPts = [];
        for (let k = 0; k <= 6; k++) {
          const t = k / 6;
          strutPts.push({
            x: lerp(attachX, axleX, t),
            y: lerp(attachY, axleY, t),
            z: attachZ
          });
        }
        emitPolyline3D(strutPts, 'primary', false, 0);

        const bracePts = [];
        for (let k = 0; k <= 4; k++) {
          const t = k / 4;
          bracePts.push({
            x: lerp(side * 0.62, (attachX + axleX) * 0.55, t),
            y: lerp(-0.34, (attachY + axleY) * 0.55, t),
            z: lerp(-0.45, attachZ, t)
          });
        }
        emitPolyline3D(bracePts, 'secondary', false, 0);

        // Main Gear Door (Gloss White with Red warning edge)
        emitFace([
          { x: attachX + side * 0.14, y: attachY, z: attachZ + 0.34 },
          { x: attachX + side * 0.14, y: attachY, z: attachZ - 0.34 },
          { x: attachX + side * 0.34, y: attachY - 0.48 * cosG, z: attachZ - 0.28 },
          { x: attachX + side * 0.34, y: attachY - 0.48 * cosG, z: attachZ + 0.28 }
        ], [
          { i0: 0, i1: 1, style: 'secondary' },
          { i0: 1, i1: 2, style: 'accent' },
          { i0: 2, i1: 3, style: 'accent' },
          { i0: 3, i1: 0, style: 'secondary' }
        ], theme.ajtWhiteTop);

        // Solid 3D Main Wheel Tire (Charcoal Rubber Tire + Silver Hub Cap)
        const wR = 0.28;
        const wSegs = 16;
        const wheelIn = [];
        const wheelOut = [];
        for (let i = 0; i < wSegs; i++) {
          const a = (i / wSegs) * Math.PI * 2 + state.wheelSpin;
          const wy = axleY + Math.sin(a) * wR * cosG;
          const wz = axleZ + Math.cos(a) * wR;
          wheelIn.push({ x: axleX - side * 0.04 * cosG, y: wy, z: wz });
          wheelOut.push({ x: axleX + side * 0.12 * cosG, y: wy, z: wz });
        }
        const tireRings = side > 0 ? [wheelIn, wheelOut] : [wheelOut, wheelIn];
        emitLoftedSurface(tireRings, {
          closedRing: true,
          capStart: true,
          capEnd: true,
          capStartColor: theme.ajtHub,
          capEndColor: theme.ajtHub,
          colorFn: () => theme.ajtTire,
          ringCreases: { 0: 'primary', 1: 'primary' }
        });
      });

      // Nose Landing Gear at Z = +4.2
      const nAttachY = -0.28;
      const nAttachZ = 4.2;
      const nAxleY = nAttachY - 0.86 * gear;
      const nAxleZ = nAttachZ - (1 - gear) * 0.65;

      const nStrutPts = [];
      for (let k = 0; k <= 5; k++) {
        const t = k / 5;
        nStrutPts.push({
          x: 0,
          y: lerp(nAttachY, nAxleY, t),
          z: lerp(nAttachZ, nAxleZ, t)
        });
      }
      emitPolyline3D(nStrutPts, 'primary', false, 0);

      const nwR = 0.18;
      const nwSegs = 12;
      const nwL = [];
      const nwRgt = [];
      for (let i = 0; i < nwSegs; i++) {
        const a = (i / nwSegs) * Math.PI * 2 + state.wheelSpin;
        const wy = nAxleY + Math.sin(a) * nwR;
        const wz = nAxleZ + Math.cos(a) * nwR;
        nwL.push({ x: -0.09, y: wy, z: wz });
        nwRgt.push({ x:  0.09, y: wy, z: wz });
      }
      emitLoftedSurface([nwL, nwRgt], {
        closedRing: true,
        capStart: true,
        capEnd: true,
        capStartColor: theme.ajtHub,
        capEndColor: theme.ajtHub,
        colorFn: () => theme.ajtTire,
        ringCreases: { 0: 'secondary', 1: 'secondary' }
      });
    }

    return [...faces, ...segments];
  }

  // =========================================================================
  // Vector Block Characters on Runway Surface (RWY 36 at start, RWY 18 ahead)
  // =========================================================================
  const DIGIT_STROKES = {
    '1': [
      [[-0.2, 0.8], [0.1, 1.0], [0.1, 0.0]],
      [[-0.25, 0.0], [0.35, 0.0]]
    ],
    '3': [
      [[-0.35, 0.85], [0.0, 1.0], [0.35, 0.85], [0.35, 0.58], [0.0, 0.5], [0.35, 0.42], [0.35, 0.15], [0.0, 0.0], [-0.35, 0.15]]
    ],
    '6': [
      [[0.30, 0.90], [-0.05, 1.0], [-0.35, 0.80], [-0.35, 0.15], [0.0, 0.0], [0.35, 0.15], [0.35, 0.45], [0.0, 0.55], [-0.35, 0.42]]
    ],
    '8': [
      [[0.0, 0.5], [-0.32, 0.62], [-0.32, 0.88], [0.0, 1.0], [0.32, 0.88], [0.32, 0.62], [0.0, 0.5], [-0.35, 0.38], [-0.35, 0.12], [0.0, 0.0], [0.35, 0.12], [0.35, 0.38], [0.0, 0.5]]
    ]
  };

  function drawRunwayNumber3D(ctx, cam, width, height, digits, centerZ, zLength, charWidth, direction) {
    const spacing = charWidth * 1.45;
    const startX = -((digits.length - 1) * spacing) * 0.5;

    for (let c = 0; c < digits.length; c++) {
      const ch = digits[c];
      const strokes = DIGIT_STROKES[ch];
      if (!strokes) continue;
      const cx = startX + c * spacing;

      strokes.forEach(poly => {
        ctx.beginPath();
        let started = false;
        for (let i = 0; i < poly.length; i++) {
          const wx = direction * (cx + poly[i][0] * charWidth);
          const wz = centerZ + direction * poly[i][1] * zLength;
          const p = projectPoint({ x: wx, y: 0.01, z: wz }, cam, width, height);
          if (!p) continue;
          if (!started) {
            ctx.moveTo(p.sx, p.sy);
            started = true;
          } else {
            ctx.lineTo(p.sx, p.sy);
          }
        }
        ctx.stroke();
      });
    }
  }

  // =========================================================================
  // Main Canvas Render Pipeline
  // =========================================================================
  const ctx = canvas.getContext('2d');
  const exhaust = exhaustCanvas.getContext('2d');
  let nozzleProjections = [];

  function drawExhaust(now, power, gentleMotion) {
    exhaust.clearRect(0, 0, exhaustCanvas.width, exhaustCanvas.height);
    if (power <= .01) return;

    exhaust.save();
    exhaust.globalCompositeOperation = 'screen';
    for (const { start, end, phase } of nozzleProjections) {
      const pulse = gentleMotion ? 0 : Math.sin(now * .0085 + phase) * .135 + Math.sin(now * .026 + phase) * .045;
      const dx = end.sx - start.sx;
      const dy = end.sy - start.sy;
      const length = Math.hypot(dx, dy);
      const reach = length * ((.25 + power * .60) * 1.24 + pulse);
      const radius = start.scale * (.095 + power * .11 + pulse * .11) * 1.15;
      const bend = radius * pulse * 3.8;

      exhaust.save();
      exhaust.translate(start.sx, start.sy);
      exhaust.rotate(Math.atan2(dy, dx));
      const envelope = exhaust.createLinearGradient(0, 0, reach, 0);
      envelope.addColorStop(0, 'rgba(231,244,255,.88)');
      envelope.addColorStop(.23, 'rgba(117,169,255,.78)');
      envelope.addColorStop(.62, 'rgba(255,148,62,.72)');
      envelope.addColorStop(1, 'rgba(255,69,24,0)');
      exhaust.globalAlpha = power;
      exhaust.fillStyle = envelope;
      exhaust.shadowColor = 'rgba(255,140,78,.60)';
      exhaust.shadowBlur = radius;
      exhaust.beginPath();
      exhaust.moveTo(0, -radius * .72);
      exhaust.bezierCurveTo(reach * .26, -radius, reach * .66, -radius * .50 + bend, reach, bend);
      exhaust.bezierCurveTo(reach * .69, radius * .52 + bend, reach * .26, radius, 0, radius * .72);
      exhaust.closePath();
      exhaust.fill();
      exhaust.shadowBlur = 0;
      exhaust.clip();

      const core = exhaust.createLinearGradient(0, 0, reach * .74, 0);
      core.addColorStop(0, 'rgba(255,250,230,.95)');
      core.addColorStop(.44, 'rgba(255,211,148,.93)');
      core.addColorStop(1, 'rgba(255,233,204,0)');
      exhaust.fillStyle = core;
      exhaust.beginPath();
      exhaust.moveTo(0, -radius * .36);
      exhaust.quadraticCurveTo(reach * .37, -radius * .47, reach * .74, bend * .44);
      exhaust.quadraticCurveTo(reach * .37, radius * .47, 0, radius * .36);
      exhaust.closePath();
      exhaust.fill();

      // Carry separate luminous streaks down the flame while the aircraft can stay still.
      exhaust.globalAlpha = Math.sqrt(power) * (gentleMotion ? .74 : 1);
      const transit = now / (gentleMotion ? 1320 : 930 - 330 * power) + phase * .08;
      for (let index = 0; index < 4; index += 1) {
        const travel = (transit + index * .25) % 1;
        const fade = Math.sin(travel * Math.PI) ** 1.4;
        const front = reach * (.12 + travel * .91);
        const back = Math.max(0, front - reach * (.08 + travel * .19));
        const lane = index % 2 === 0 ? -.33 : .33;
        const height = radius * (lane * (1 - travel * .73) + .10 * Math.sin(travel * 7 + phase)) + bend * travel;
        const streak = exhaust.createLinearGradient(back, 0, front, 0);
        streak.addColorStop(0, 'rgba(255,139,52,0)');
        streak.addColorStop(.56, `rgba(255,170,70,${fade * .65})`);
        streak.addColorStop(.83, `rgba(255,245,204,${fade * .9})`);
        streak.addColorStop(1, 'rgba(255,202,111,0)');
        exhaust.strokeStyle = streak;
        exhaust.lineWidth = Math.max(1.2, radius * (.25 - travel * .11));
        exhaust.lineCap = 'round';
        exhaust.beginPath();
        exhaust.moveTo(back, height - bend * .28);
        exhaust.quadraticCurveTo((front + back) * .5, height + radius * .13 * fade, front, height);
        exhaust.stroke();
      }
      exhaust.restore();
    }
    exhaust.restore();
  }

  function renderScene() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const width = canvas.width;
    const height = canvas.height;
    const theme = THEMES[state.styleMode];

    ctx.save();

    // 1. Sky Background
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0, theme.skyTop);
    skyGrad.addColorStop(1, theme.skyBottom);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Aircraft & Rear Chase Camera Pose
    const pitchRad = (state.pitchDeg * Math.PI) / 180;
    const rollRad = (state.rollOsc * Math.PI) / 180;

    const altMeters = state.altitudeFt * 0.3048;
    const rotationLift = Math.sin(pitchRad) * 0.65 * (1 - smoothstep(0.65, 0.74, state.progress));
    const acPos = {
      x: 0,
      y: 1.40 + rotationLift + altMeters,
      z: state.distanceM
    };

    const climbLagY = Math.min(altMeters * 0.28, 12);
    const chaseOffset = lerp(2.45, 4.40, smoothstep(.69, 1, state.progress));
    const chaseDistance = 13.1;
    const cam = {
      x: acPos.x + chaseOffset,
      y: acPos.y + 3.4 - climbLagY * .22 - 1.15 * smoothstep(.78, 1, state.progress),
      z: acPos.z - chaseDistance,
      yaw: -Math.atan2(chaseOffset, chaseDistance) + .025,
      pitch: -0.165 + climbLagY * .006,
      fov: Math.min(width, height) * .98
    };
    nozzleProjections = [-.34, .34].map((x, index) => {
      const start = projectPoint(aircraftToWorld(x, .01, -4.11, acPos, pitchRad, rollRad), cam, width, height);
      const end = projectPoint(aircraftToWorld(x, .01, -6.65, acPos, pitchRad, rollRad), cam, width, height);
      return { start, end, phase: index * 1.8 };
    }).filter(nozzle => nozzle.start && nozzle.end);

    // 3. Horizon Line & Ground Grid
    const horizonPt = projectPoint({ x: 0, y: 0, z: cam.z + 4000 }, cam, width, height);
    const horizonY = horizonPt ? horizonPt.sy : height * 0.48;

    ctx.fillStyle = theme.groundFill;
    ctx.fillRect(0, Math.max(0, horizonY), width, height - Math.max(0, horizonY));

    ctx.strokeStyle = theme.gridLine;
    ctx.lineWidth = 1 * dpr;

    for (let gx = -120; gx <= 120; gx += 15) {
      if (Math.abs(gx) <= 18) continue;
      const pNear = projectPoint({ x: gx, y: 0, z: cam.z + 2 }, cam, width, height);
      const pFar = projectPoint({ x: gx, y: 0, z: cam.z + 900 }, cam, width, height);
      if (pNear && pFar) {
        ctx.beginPath();
        ctx.moveTo(pNear.sx, pNear.sy);
        ctx.lineTo(pFar.sx, pFar.sy);
        ctx.stroke();
      }
    }

    const firstGridZ = Math.floor((cam.z + 4) / 25) * 25;
    for (let gz = firstGridZ; gz < cam.z + 650; gz += 25) {
      const pL = projectPoint({ x: -120, y: 0, z: gz }, cam, width, height);
      const pR = projectPoint({ x:  120, y: 0, z: gz }, cam, width, height);
      if (pL && pR) {
        ctx.beginPath();
        ctx.moveTo(pL.sx, pL.sy);
        ctx.lineTo(pR.sx, pR.sy);
        ctx.stroke();
      }
    }

    ctx.strokeStyle = theme.horizonLine;
    ctx.lineWidth = 1.4 * dpr;
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.lineTo(width, horizonY);
    ctx.stroke();

    // 4. Runway 36 -> 18 Surface & Markings
    const rwyHalfWidth = 16.0;
    // Keep both near corners in front of the camera as it swings to starboard.
    const nearClearance = 2 + (rwyHalfWidth + Math.abs(cam.x)) * Math.abs(Math.tan(cam.yaw));
    const rwyNearZ = Math.max(-22, cam.z + nearClearance);
    const rwyFarZ = 2400;

    const rwyCorners = [
      projectPoint({ x: -rwyHalfWidth, y: 0, z: rwyNearZ }, cam, width, height),
      projectPoint({ x:  rwyHalfWidth, y: 0, z: rwyNearZ }, cam, width, height),
      projectPoint({ x:  rwyHalfWidth, y: 0, z: rwyFarZ }, cam, width, height),
      projectPoint({ x: -rwyHalfWidth, y: 0, z: rwyFarZ }, cam, width, height)
    ];

    if (rwyCorners.every(Boolean)) {
      ctx.fillStyle = theme.rwyFill;
      ctx.beginPath();
      ctx.moveTo(rwyCorners[0].sx, rwyCorners[0].sy);
      ctx.lineTo(rwyCorners[1].sx, rwyCorners[1].sy);
      ctx.lineTo(rwyCorners[2].sx, rwyCorners[2].sy);
      ctx.lineTo(rwyCorners[3].sx, rwyCorners[3].sy);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = theme.rwyStroke;
      ctx.lineWidth = 2.0 * dpr;
      ctx.beginPath();
      ctx.moveTo(rwyCorners[0].sx, rwyCorners[0].sy);
      ctx.lineTo(rwyCorners[3].sx, rwyCorners[3].sy);
      ctx.moveTo(rwyCorners[1].sx, rwyCorners[1].sy);
      ctx.lineTo(rwyCorners[2].sx, rwyCorners[2].sy);
      ctx.stroke();
    }

    ctx.strokeStyle = theme.rwyMarking;
    ctx.lineWidth = 1.8 * dpr;

    for (const [from, to] of [[-17, -3], [rwyFarZ - 17, rwyFarZ - 3]]) {
      for (const kx of [-13, -10.4, -7.8, -5.2, -2.6, 2.6, 5.2, 7.8, 10.4, 13]) {
        const p1 = projectPoint({ x: kx, y: 0.01, z: from }, cam, width, height);
        const p2 = projectPoint({ x: kx, y: 0.01, z: to }, cam, width, height);
        if (!p1 || !p2) continue;
        ctx.beginPath();
        ctx.moveTo(p1.sx, p1.sy);
        ctx.lineTo(p2.sx, p2.sy);
        ctx.stroke();
      }
    }

    ctx.lineWidth = 2.4 * dpr;
    drawRunwayNumber3D(ctx, cam, width, height, '36', 26, 17, 4.2, 1);
    drawRunwayNumber3D(ctx, cam, width, height, '18', rwyFarZ - 48, 17, 4.2, -1);
    ctx.lineWidth = 2.0 * dpr;
    const startDashZ = Math.max(54, Math.floor((cam.z + 2) / 30) * 30);
    for (let dz = startDashZ; dz < Math.min(cam.z + 900, rwyFarZ - 64); dz += 30) {
      const p1 = projectPoint({ x: 0, y: 0.01, z: dz }, cam, width, height);
      const p2 = projectPoint({ x: 0, y: 0.01, z: dz + 16 }, cam, width, height);
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.sx, p1.sy);
        ctx.lineTo(p2.sx, p2.sy);
        ctx.stroke();
      }
    }

    for (let bz = 140; bz < 1500; bz += 220) {
      if (bz < cam.z + 2 || bz > cam.z + 750) continue;
      [-1, 1].forEach(side => {
        [4.5, 6.2, 7.9].forEach(bx => {
          const p1 = projectPoint({ x: side * bx, y: 0.01, z: bz }, cam, width, height);
          const p2 = projectPoint({ x: side * bx, y: 0.01, z: bz + 26 }, cam, width, height);
          if (p1 && p2) {
            ctx.beginPath();
            ctx.moveTo(p1.sx, p1.sy);
            ctx.lineTo(p2.sx, p2.sy);
            ctx.stroke();
          }
        });
      });
    }

    const firstLightZ = Math.max(0, Math.floor((cam.z + 3) / 20) * 20);
    for (let lz = firstLightZ; lz < cam.z + 380; lz += 20) {
      [-1, 1].forEach(side => {
        const lx = side * (rwyHalfWidth + 1.2);
        const pBase = projectPoint({ x: lx, y: 0, z: lz }, cam, width, height);
        const pTop = projectPoint({ x: lx, y: 0.55, z: lz }, cam, width, height);
        if (pBase && pTop) {
          ctx.strokeStyle = theme.secondaryLine;
          ctx.lineWidth = 1.2 * dpr;
          ctx.beginPath();
          ctx.moveTo(pBase.sx, pBase.sy);
          ctx.lineTo(pTop.sx, pTop.sy);
          ctx.stroke();

          const r = Math.max(1.2 * dpr, Math.min(3.5 * dpr, pTop.scale * 0.08));
          ctx.fillStyle = theme.runwayLight;
          ctx.beginPath();
          ctx.arc(pTop.sx, pTop.sy, r, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    const glowCenter = projectPoint(acPos, cam, width, height);
    if (glowCenter) {
      const { sx, sy } = glowCenter;
      const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, Math.min(width * .64, height * .53));
      glow.addColorStop(0, light);
      glow.addColorStop(1, 'transparent');
      ctx.save();
      ctx.globalAlpha = .36 + .64 * smoothstep(.36, .70, state.progress);
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    // 5. Soft Ground Shadow under Aircraft on Runway Surface
    const shadowOutlineLocal = [
      { x: 0, y: 0, z: 7.8 },
      { x: 0.9, y: 0, z: 1.5 },
      { x: 4.65, y: 0, z: -1.45 },
      { x: 4.50, y: 0, z: -2.40 },
      { x: 0.82, y: 0, z: -2.10 },
      { x: 2.35, y: 0, z: -3.50 },
      { x: 2.15, y: 0, z: -4.05 },
      { x: 0, y: 0, z: -3.90 },
      { x: -2.15, y: 0, z: -4.05 },
      { x: -2.35, y: 0, z: -3.50 },
      { x: -0.82, y: 0, z: -2.10 },
      { x: -4.50, y: 0, z: -2.40 },
      { x: -4.65, y: 0, z: -1.45 },
      { x: -0.9, y: 0, z: 1.5 }
    ];
    const shadowPts = shadowOutlineLocal.map(lp => {
      const wp = aircraftToWorld(lp.x, lp.y, lp.z, acPos, pitchRad, rollRad);
      return projectPoint({ x: wp.x, y: 0.02, z: wp.z }, cam, width, height);
    }).filter(Boolean);

    if (shadowPts.length > 4) {
      const shadowAlpha = clamp(0.18 - altMeters * 0.002, 0.03, 0.18);
      ctx.save();
      ctx.fillStyle = '#0f172a';
      ctx.globalAlpha = shadowAlpha;
      ctx.beginPath();
      shadowPts.forEach((sp, idx) => {
        if (idx === 0) ctx.moveTo(sp.sx, sp.sy);
        else ctx.lineTo(sp.sx, sp.sy);
      });
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // 6. Unified Depth-Sorted 3D Aircraft Rendering (Colored Livery + Watertight HLR)
    const renderables = buildAJTRenderables(state, acPos, pitchRad, rollRad, cam, width, height, theme);

    renderables.sort((a, b) => b.depth - a.depth);

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    renderables.forEach(item => {
      if (item.type === 'face') {
        const pts = item.scrPts;
        ctx.beginPath();
        for (let i = 0; i < pts.length; i++) {
          if (i === 0) ctx.moveTo(pts[i].sx, pts[i].sy);
          else ctx.lineTo(pts[i].sx, pts[i].sy);
        }
        ctx.closePath();

        // Fill with authentic AJT livery color + 1px seam seal to prevent anti-aliasing gaps
        const fillCol = item.fillColor || theme.occludeFill;
        ctx.fillStyle = fillCol;
        ctx.fill();
        ctx.strokeStyle = fillCol;
        ctx.lineWidth = 1.15 * dpr;
        ctx.stroke();

        // Draw visible silhouette, crease & livery boundary edges
        if (item.edges && item.edges.length > 0) {
          item.edges.forEach(e => {
            const pA = pts[e.i0];
            const pB = pts[e.i1];
            if (e.style === 'primary') {
              ctx.strokeStyle = theme.primaryLine;
              ctx.lineWidth = 1.95 * dpr;
            } else if (e.style === 'secondary') {
              ctx.strokeStyle = theme.secondaryLine;
              ctx.lineWidth = 1.3 * dpr;
            } else if (e.style === 'accent') {
              ctx.strokeStyle = theme.accentLine;
              ctx.lineWidth = 1.6 * dpr;
            } else {
              ctx.strokeStyle = theme.detailLine;
              ctx.lineWidth = 0.85 * dpr;
            }
            ctx.beginPath();
            ctx.moveTo(pA.sx, pA.sy);
            ctx.lineTo(pB.sx, pB.sy);
            ctx.stroke();
          });
        }
      } else if (item.type === 'segment') {
        if (item.style === 'primary') {
          ctx.strokeStyle = theme.primaryLine;
          ctx.lineWidth = 2.2 * dpr;
        } else if (item.style === 'secondary') {
          ctx.strokeStyle = theme.secondaryLine;
          ctx.lineWidth = 1.45 * dpr;
        } else {
          ctx.strokeStyle = theme.detailLine;
          ctx.lineWidth = 0.95 * dpr;
        }
        ctx.beginPath();
        ctx.moveTo(item.pa.sx, item.pa.sy);
        ctx.lineTo(item.pb.sx, item.pb.sy);
        ctx.stroke();
      }
    });

    drawFinMarkings(acPos, pitchRad, rollRad, cam, width, height, theme);

    // Each airflow trail begins on the trailing cap of its wingtip rail.
    const vortexStrength = smoothstep(0.43, 0.58, state.progress);
    if (vortexStrength > 0.02) {
      const vPhase = state.distanceM * 0.25;
      [-1, 1].forEach(side => {
        ctx.save();
        ctx.strokeStyle = theme.vortexLine;
        ctx.lineWidth = 1.45 * dpr;
        ctx.globalAlpha = vortexStrength * 0.75;
        ctx.beginPath();
        let started = false;
        const steps = 28;
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const lp = wingtipWakePoint(side, t, vPhase, vortexStrength);
          const wp = aircraftToWorld(lp.x, lp.y, lp.z, acPos, pitchRad, rollRad);
          wp.y = Math.max(0.15, wp.y - t * 0.30);
          const sp = projectPoint(wp, cam, width, height);
          if (sp) {
            if (!started) {
              ctx.moveTo(sp.sx, sp.sy);
              started = true;
            } else {
              ctx.lineTo(sp.sx, sp.sy);
            }
          }
        }
        ctx.stroke();
        ctx.restore();
      });
    }

    ctx.restore();
  }

  if (!ctx || !exhaust) return null;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let flameFrame = null;
  let renderedProgress = null;

  function drawFlameFrame(now) {
    const p = state.progress;
    const power = .30 + .70 * smoothstep(.025, .32, p) - .52 * smoothstep(.78, 1, p);
    drawExhaust(now, power, reducedMotion.matches);
    flameFrame = requestAnimationFrame(drawFlameFrame);
  }

  return {
    update(progress, visible) {
      if (!visible) {
        if (flameFrame !== null) cancelAnimationFrame(flameFrame);
        flameFrame = null;
        return;
      }

      const ratio = Math.min(2, window.devicePixelRatio || 1);
      const width = Math.max(1, Math.round(canvas.clientWidth * ratio));
      const height = Math.max(1, Math.round(canvas.clientHeight * ratio));
      const resized = canvas.width !== width || canvas.height !== height;
      if (resized) {
        canvas.width = exhaustCanvas.width = width;
        canvas.height = exhaustCanvas.height = height;
      }

      if (resized || renderedProgress !== progress) {
        state.progress = progress;
        updateKinematics(progress);
        renderScene();
        renderedProgress = progress;
      }
      if (flameFrame === null) flameFrame = requestAnimationFrame(drawFlameFrame);
    },
  };
}

// SRT 역 목록 (SVG 좌표 포함)
// tx/ty: 레이블 텍스트 위치, ta: text-anchor (start/end/middle)
export const SRT_STATIONS = [
  { name: '수서',       x: 215, y:  42, tx: 225, ty:  46, ta: 'start' },
  { name: '동탄',       x: 207, y:  80, tx: 217, ty:  84, ta: 'start' },
  { name: '평택지제',   x: 195, y: 116, tx: 205, ty: 120, ta: 'start' },
  { name: '천안아산',   x: 176, y: 155, tx: 164, ty: 152, ta: 'end'   },
  { name: '오송',       x: 184, y: 193, tx: 194, ty: 197, ta: 'start' },
  { name: '공주',       x: 142, y: 193, tx: 130, ty: 197, ta: 'end'   },
  { name: '대전',       x: 195, y: 232, tx: 205, ty: 236, ta: 'start' },
  { name: '익산',       x: 142, y: 258, tx: 130, ty: 262, ta: 'end'   },
  { name: '전주',       x: 166, y: 287, tx: 176, ty: 291, ta: 'start' },
  { name: '정읍',       x: 136, y: 298, tx: 124, ty: 302, ta: 'end'   },
  { name: '남원',       x: 180, y: 326, tx: 190, ty: 330, ta: 'start' },
  { name: '광주송정',   x: 134, y: 338, tx: 122, ty: 342, ta: 'end'   },
  { name: '곡성',       x: 192, y: 355, tx: 202, ty: 359, ta: 'start' },
  { name: '나주',       x: 130, y: 374, tx: 118, ty: 378, ta: 'end'   },
  { name: '구례구',     x: 202, y: 383, tx: 212, ty: 387, ta: 'start' },
  { name: '목포',       x: 116, y: 413, tx: 116, ty: 427, ta: 'middle'},
  { name: '순천',       x: 220, y: 410, tx: 230, ty: 414, ta: 'start' },
  { name: '여천',       x: 228, y: 434, tx: 238, ty: 438, ta: 'start' },
  { name: '여수엑스포', x: 228, y: 458, tx: 228, ty: 472, ta: 'middle'},
  { name: '김천구미',   x: 255, y: 267, tx: 265, ty: 271, ta: 'start' },
  { name: '동대구',     x: 298, y: 288, tx: 308, ty: 292, ta: 'start' },
  { name: '서대구',     x: 278, y: 300, tx: 266, ty: 312, ta: 'end'   },
  { name: '경주',       x: 344, y: 282, tx: 354, ty: 286, ta: 'start' },
  { name: '포항',       x: 382, y: 248, tx: 392, ty: 252, ta: 'start' },
  { name: '울산',       x: 340, y: 318, tx: 350, ty: 322, ta: 'start' },
  { name: '밀양',       x: 293, y: 334, tx: 303, ty: 338, ta: 'start' },
  { name: '부산',       x: 316, y: 364, tx: 326, ty: 368, ta: 'start' },
  { name: '창원중앙',   x: 281, y: 364, tx: 269, ty: 358, ta: 'end'   },
  { name: '창원',       x: 266, y: 375, tx: 254, ty: 372, ta: 'end'   },
  { name: '마산',       x: 252, y: 381, tx: 240, ty: 393, ta: 'end'   },
  { name: '진주',       x: 234, y: 394, tx: 222, ty: 405, ta: 'end'   },
];

export const SRT_LINES = [
  { name: '경부', stations: ['수서','동탄','평택지제','천안아산','오송','대전','김천구미','동대구','경주','울산','부산'] },
  { name: '호남', stations: ['오송','공주','익산','정읍','광주송정','나주','목포'] },
  { name: '전라', stations: ['익산','전주','남원','곡성','구례구','순천','여천','여수엑스포'] },
  { name: '경전', stations: ['동대구','서대구','밀양','창원중앙','창원','마산','진주'] },
  { name: '동해', stations: ['동대구','포항'] },
];

// KTX — 수서/동탄/평택지제 대신 서울/광명으로 시작, 나머지 공유
export const KTX_STATIONS = [
  { name: '서울',       x: 215, y:  20, tx: 225, ty:  24, ta: 'start' },
  { name: '광명',       x: 205, y:  55, tx: 215, ty:  59, ta: 'start' },
  { name: '천안아산',   x: 176, y: 105, tx: 164, ty: 102, ta: 'end'   },
  { name: '오송',       x: 184, y: 142, tx: 194, ty: 146, ta: 'start' },
  { name: '공주',       x: 142, y: 142, tx: 130, ty: 146, ta: 'end'   },
  { name: '대전',       x: 195, y: 182, tx: 205, ty: 186, ta: 'start' },
  { name: '익산',       x: 142, y: 210, tx: 130, ty: 214, ta: 'end'   },
  { name: '전주',       x: 166, y: 240, tx: 176, ty: 244, ta: 'start' },
  { name: '정읍',       x: 136, y: 252, tx: 124, ty: 256, ta: 'end'   },
  { name: '남원',       x: 180, y: 280, tx: 190, ty: 284, ta: 'start' },
  { name: '광주송정',   x: 134, y: 292, tx: 122, ty: 296, ta: 'end'   },
  { name: '곡성',       x: 192, y: 310, tx: 202, ty: 314, ta: 'start' },
  { name: '나주',       x: 130, y: 328, tx: 118, ty: 332, ta: 'end'   },
  { name: '구례구',     x: 202, y: 337, tx: 212, ty: 341, ta: 'start' },
  { name: '목포',       x: 116, y: 366, tx: 116, ty: 380, ta: 'middle'},
  { name: '순천',       x: 220, y: 364, tx: 230, ty: 368, ta: 'start' },
  { name: '여천',       x: 228, y: 388, tx: 238, ty: 392, ta: 'start' },
  { name: '여수엑스포', x: 228, y: 412, tx: 228, ty: 426, ta: 'middle'},
  { name: '김천구미',   x: 255, y: 220, tx: 265, ty: 224, ta: 'start' },
  { name: '동대구',     x: 298, y: 242, tx: 308, ty: 246, ta: 'start' },
  { name: '서대구',     x: 278, y: 254, tx: 266, ty: 266, ta: 'end'   },
  { name: '경주',       x: 344, y: 236, tx: 354, ty: 240, ta: 'start' },
  { name: '포항',       x: 382, y: 202, tx: 392, ty: 206, ta: 'start' },
  { name: '울산',       x: 340, y: 272, tx: 350, ty: 276, ta: 'start' },
  { name: '밀양',       x: 293, y: 288, tx: 303, ty: 292, ta: 'start' },
  { name: '부산',       x: 316, y: 318, tx: 326, ty: 322, ta: 'start' },
  { name: '창원중앙',   x: 281, y: 318, tx: 269, ty: 312, ta: 'end'   },
  { name: '창원',       x: 266, y: 330, tx: 254, ty: 326, ta: 'end'   },
  { name: '마산',       x: 252, y: 336, tx: 240, ty: 348, ta: 'end'   },
  { name: '진주',       x: 234, y: 348, tx: 222, ty: 360, ta: 'end'   },
];

export const KTX_LINES = [
  { name: '경부', stations: ['서울','광명','천안아산','오송','대전','김천구미','동대구','경주','울산','부산'] },
  { name: '호남', stations: ['서울','광명','천안아산','오송','공주','익산','정읍','광주송정','나주','목포'] },
  { name: '전라', stations: ['익산','전주','남원','곡성','구례구','순천','여천','여수엑스포'] },
  { name: '경전', stations: ['동대구','서대구','밀양','창원중앙','창원','마산','진주'] },
  { name: '동해', stations: ['동대구','포항'] },
];

export const BUS_CITIES = [
  '서울(강남)', '서울(센트럴)', '서울(동서울)', '인천',
  '수원', '성남(판교)', '안양', '부천',
  '대전', '세종', '청주', '천안',
  '전주', '군산', '광주', '여수',
  '대구', '구미', '포항', '안동',
  '부산', '울산', '창원', '진주',
  '춘천', '원주', '강릉', '속초',
];

// 역 이름 → 좌표 맵 생성 헬퍼
export function buildPositionMap(stations) {
  return Object.fromEntries(stations.map(s => [s.name, s]));
}

// 노선 연결선 목록 생성 헬퍼
export function buildConnections(lines, posMap) {
  const conns = [];
  for (const line of lines) {
    for (let i = 0; i < line.stations.length - 1; i++) {
      const a = posMap[line.stations[i]];
      const b = posMap[line.stations[i + 1]];
      if (a && b) conns.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
    }
  }
  return conns;
}

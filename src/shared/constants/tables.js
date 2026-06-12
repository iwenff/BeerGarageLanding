export const RAW_TABLES = [
  {
    id: 1,
    label: '1',
    x: 105, y: 580, width: 70, height: 100,
    chairs: [
      { x: 80,  y: 590, label: '1-1' },
      { x: 80,  y: 630, label: '1-2' },
      { x: 200, y: 605, label: '1-3' },
      { x: 200, y: 655, label: '1-4' },
      { x: 80,  y: 670, label: '1-5' },
    ],
  },
  {
    id: 2,
    label: '2',
    x: 60, y: 345, width: 210, height: 70,
    chairs: [
      { x: 90,  y: 325, label: '2-1' },
      { x: 140, y: 325, label: '2-2' },
      { x: 190, y: 325, label: '2-3' },
      { x: 240, y: 325, label: '2-4' },
      { x: 90,  y: 435, label: '2-5' },
      { x: 140, y: 435, label: '2-6' },
      { x: 190, y: 435, label: '2-7' },
      { x: 240, y: 435, label: '2-8' },
    ],
  },
  {
    id: 3,
    label: '3',
    x: 465, y: 300, width: 80, height: 80,
    chairs: [
      { x: 440, y: 320, label: '3-1' },
      { x: 440, y: 360, label: '3-2' },
      { x: 565, y: 320, label: '3-3' },
      { x: 565, y: 360, label: '3-4' },
    ],
  },
  // ── VIP ──
  {
    id: 4,
    label: '4',
    vip: true,
    x: 520, y: 130, width: 50, height: 80,
    chairs: [
      { x: 545, y: 110, label: '4-1' },
      { x: 545, y: 230, label: '4-2' },
    ],
  },
  {
    id: 5,
    label: '5',
    vip: true,
    x: 680, y: 80, width: 110, height: 50,
    chairs: [
      { x: 700, y: 55,  label: '5-1' },
      { x: 740, y: 55,  label: '5-2' },
      { x: 780, y: 55,  label: '5-3' },
      { x: 710, y: 150, label: '5-4' },
      { x: 660, y: 105, label: '5-5' },
      { x: 760, y: 150, label: '5-6' },
    ],
  },
  {
    id: 6,
    label: '6',
    vip: true,
    x: 705, y: 250, width: 80, height: 50,
    chairs: [
      { x: 690, y: 275, label: '6-1' },
      { x: 800, y: 275, label: '6-2' },
    ],
  },
  // ── низ зала ──
  {
    id: 7,
    label: '7',
    x: 530, y: 840, width: 80, height: 30,
    chairs: [
      { x: 550, y: 820, label: '7-1' },
      { x: 590, y: 820, label: '7-2' },
    ],
  },
  {
    id: 8,
    label: 'BAR',
    x: 650, y: 420, width: 50, height: 450,
    chairs: [
      { x: 630, y: 440, label: 'BAR-1' },
      { x: 630, y: 485, label: 'BAR-2' },
      { x: 630, y: 535, label: 'BAR-3' },
      { x: 630, y: 585, label: 'BAR-4' },
      { x: 630, y: 635, label: 'BAR-5' },
      { x: 630, y: 685, label: 'BAR-6' },
      { x: 630, y: 735, label: 'BAR-7' },
      { x: 630, y: 785, label: 'BAR-8' },
    ],
  },
]

export const TABLES = RAW_TABLES.map((t) => ({
  ...t,
  chairs: t.chairs.map((c, i) => ({ ...c, key: `${t.id}_${i}` })),
}))

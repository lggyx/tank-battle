// 坦克大战游戏核心逻辑
const GRID_SIZE = 16; // 网格单位大小，一个网格16*16像素
const GRID_COUNT = 40; // 40x40网格
const GAME_SIZE = GRID_SIZE * GRID_COUNT; // 游戏区域总大小
const TANK_SIZE = GRID_SIZE * 2; // 坦克占2*2个网格，尺寸为32*32

// 方向常量已在const.js中定义为:
// UP = 0, DOWN = 1, LEFT = 2, RIGHT = 3

// 游戏对象类型
const OBJECT_TYPE = {
    EMPTY: 'empty',
    PLAYER: 'player',
    ENEMY: 'enemy',
    BRICK: 'brick',
    STEEL: 'steel',
    WATER: 'water',
    GRASS: 'grass',
    BASE: 'base',
    BULLET: 'bullet'
};

// 游戏关卡数据
const levelData = [
    // 关卡1: 新兵训练营
    {
        name: "新兵训练营",
        playerStart: { x: 15, y: 37 }, // 玩家坦克位置再向左移动两个网格
        basePosition: { x: 20, y: 37 }, // 老鹰位置保持在地图底部正中央
        enemies: [
            // 2个固定炮台（不可移动）
            { type: "basic", x: 10, y: 5, direction: DOWN, isStatic: true },
            { type: "basic", x: 30, y: 5, direction: DOWN, isStatic: true },
            // 1个巡逻坦克（矩形路径）
            { type: "basic", x: 20, y: 1, direction: DOWN, patrolPath: [
                { x: 20, y: 1, direction: DOWN },
                { x: 20, y: 10, direction: RIGHT },
                { x: 30, y: 10, direction: UP },
                { x: 30, y: 1, direction: LEFT }
            ]}
        ],
        map: [
            // 地图边界已由createMap方法自动创建
            
            // L型通道强制转向练习 - 左上角
            { type: OBJECT_TYPE.BRICK, x: 6, y: 10 },
            { type: OBJECT_TYPE.BRICK, x: 7, y: 10 },
            { type: OBJECT_TYPE.BRICK, x: 8, y: 10 },
            { type: OBJECT_TYPE.BRICK, x: 9, y: 10 },
            { type: OBJECT_TYPE.BRICK, x: 10, y: 10 },
            { type: OBJECT_TYPE.BRICK, x: 6, y: 11 },
            { type: OBJECT_TYPE.BRICK, x: 6, y: 12 },
            { type: OBJECT_TYPE.BRICK, x: 6, y: 13 },
            { type: OBJECT_TYPE.BRICK, x: 6, y: 14 },
            { type: OBJECT_TYPE.BRICK, x: 6, y: 15 },
            
            // 固定标靶区域 - 右上角
            { type: OBJECT_TYPE.BRICK, x: 26, y: 10 },
            { type: OBJECT_TYPE.BRICK, x: 27, y: 10 },
            { type: OBJECT_TYPE.BRICK, x: 28, y: 10 },
            { type: OBJECT_TYPE.BRICK, x: 29, y: 10 },
            { type: OBJECT_TYPE.BRICK, x: 30, y: 10 },
            { type: OBJECT_TYPE.BRICK, x: 28, y: 11 },
            { type: OBJECT_TYPE.BRICK, x: 28, y: 12 },
            { type: OBJECT_TYPE.BRICK, x: 28, y: 13 },
            { type: OBJECT_TYPE.BRICK, x: 28, y: 14 },
            
            // 移动标靶区域 - 中央水域
            { type: OBJECT_TYPE.WATER, x: 18, y: 18 },
            { type: OBJECT_TYPE.WATER, x: 19, y: 18 },
            { type: OBJECT_TYPE.WATER, x: 20, y: 18 },
            { type: OBJECT_TYPE.WATER, x: 21, y: 18 },
            { type: OBJECT_TYPE.WATER, x: 18, y: 19 },
            { type: OBJECT_TYPE.WATER, x: 19, y: 19 },
            { type: OBJECT_TYPE.WATER, x: 20, y: 19 },
            { type: OBJECT_TYPE.WATER, x: 21, y: 19 },
            { type: OBJECT_TYPE.WATER, x: 18, y: 20 },
            { type: OBJECT_TYPE.WATER, x: 19, y: 20 },
            { type: OBJECT_TYPE.WATER, x: 20, y: 20 },
            { type: OBJECT_TYPE.WATER, x: 21, y: 20 },
            { type: OBJECT_TYPE.WATER, x: 18, y: 21 },
            { type: OBJECT_TYPE.WATER, x: 19, y: 21 },
            { type: OBJECT_TYPE.WATER, x: 20, y: 21 },
            { type: OBJECT_TYPE.WATER, x: 21, y: 21 },
            
            // 草地区域 - 左下角（用于隐蔽训练）
            { type: OBJECT_TYPE.GRASS, x: 10, y: 26 },
            { type: OBJECT_TYPE.GRASS, x: 11, y: 26 },
            { type: OBJECT_TYPE.GRASS, x: 12, y: 26 },
            { type: OBJECT_TYPE.GRASS, x: 13, y: 26 },
            { type: OBJECT_TYPE.GRASS, x: 10, y: 27 },
            { type: OBJECT_TYPE.GRASS, x: 11, y: 27 },
            { type: OBJECT_TYPE.GRASS, x: 12, y: 27 },
            { type: OBJECT_TYPE.GRASS, x: 13, y: 27 },
            { type: OBJECT_TYPE.GRASS, x: 10, y: 28 },
            { type: OBJECT_TYPE.GRASS, x: 11, y: 28 },
            { type: OBJECT_TYPE.GRASS, x: 12, y: 28 },
            { type: OBJECT_TYPE.GRASS, x: 13, y: 28 },
            
            // 基地全钢墙保护 - 右下角
            { type: OBJECT_TYPE.STEEL, x: 18, y: 36 },
            { type: OBJECT_TYPE.STEEL, x: 19, y: 36 },
            { type: OBJECT_TYPE.STEEL, x: 20, y: 36 },
            { type: OBJECT_TYPE.STEEL, x: 21, y: 36 },
            { type: OBJECT_TYPE.STEEL, x: 22, y: 36 },
            { type: OBJECT_TYPE.STEEL, x: 18, y: 37 },
            { type: OBJECT_TYPE.STEEL, x: 22, y: 37 },
            { type: OBJECT_TYPE.STEEL, x: 18, y: 38 },
            { type: OBJECT_TYPE.STEEL, x: 19, y: 38 },
            { type: OBJECT_TYPE.STEEL, x: 20, y: 38 },
            { type: OBJECT_TYPE.STEEL, x: 21, y: 38 },
            { type: OBJECT_TYPE.STEEL, x: 22, y: 38 },
            
            // 巡逻路径标记 - 帮助玩家理解巡逻坦克路线
            { type: OBJECT_TYPE.GRASS, x: 20, y: 5 },
            { type: OBJECT_TYPE.GRASS, x: 20, y: 10 },
            { type: OBJECT_TYPE.GRASS, x: 30, y: 10 },
            { type: OBJECT_TYPE.GRASS, x: 30, y: 5 }
        ],
        enemyCount: 3, // 只有3个敌人，符合训练营设计
        specialRules: {
            enemySlowdown: 0.5, // 敌人移动和射击速度降低50%
            trainingMode: true, // 训练模式，提供更多提示
            protectedBase: true // 基地处于全钢墙保护状态
        }
    },
    // 关卡2: 闪电攻防战
    {
        name: "闪电攻防战",
        playerStart: { x: 15, y: 36 }, // 与第一关保持一致
        basePosition: { x: 20, y: 37 }, // 修正老鹰位置，与第1关保持一致
        enemies: [
            { type: "armor", x: 1, y: 1, direction: DOWN },
            { type: "armor", x: 38, y: 1, direction: DOWN },
            { type: "armor", x: 20, y: 1, direction: DOWN },
            { type: "fast", x: 10, y: 1, direction: DOWN },
            { type: "fast", x: 30, y: 1, direction: DOWN }
        ],
        map: [
            
            
            // 老鹰周围的内部砖墙 - 与第1关完全相同的U型结构
            { type: OBJECT_TYPE.BRICK, x: 19, y: 36 },
            { type: OBJECT_TYPE.BRICK, x: 20, y: 36 },
            { type: OBJECT_TYPE.BRICK, x: 21, y: 36 },
            { type: OBJECT_TYPE.BRICK, x: 22, y: 36 },
            
            { type: OBJECT_TYPE.BRICK, x: 19, y: 37 }, // 左边下部
            { type: OBJECT_TYPE.BRICK, x: 22, y: 37 }, // 右边下部
            
            { type: OBJECT_TYPE.BRICK, x: 19, y: 38 }, // 左底角
            { type: OBJECT_TYPE.BRICK, x: 22, y: 38 }, // 右底角
            
            
            // 中央十字形障碍物
            // 水平线
            { type: OBJECT_TYPE.STEEL, x: 15, y: 20 },
            { type: OBJECT_TYPE.STEEL, x: 16, y: 20 },
            { type: OBJECT_TYPE.STEEL, x: 17, y: 20 },
            { type: OBJECT_TYPE.STEEL, x: 18, y: 20 },
            { type: OBJECT_TYPE.STEEL, x: 19, y: 20 },
            { type: OBJECT_TYPE.STEEL, x: 20, y: 20 },
            { type: OBJECT_TYPE.STEEL, x: 21, y: 20 },
            { type: OBJECT_TYPE.STEEL, x: 22, y: 20 },
            { type: OBJECT_TYPE.STEEL, x: 23, y: 20 },
            { type: OBJECT_TYPE.STEEL, x: 24, y: 20 },
            { type: OBJECT_TYPE.STEEL, x: 25, y: 20 },
            // 垂直线
            { type: OBJECT_TYPE.STEEL, x: 20, y: 15 },
            { type: OBJECT_TYPE.STEEL, x: 20, y: 16 },
            { type: OBJECT_TYPE.STEEL, x: 20, y: 17 },
            { type: OBJECT_TYPE.STEEL, x: 20, y: 18 },
            { type: OBJECT_TYPE.STEEL, x: 20, y: 19 },
            { type: OBJECT_TYPE.STEEL, x: 20, y: 21 },
            { type: OBJECT_TYPE.STEEL, x: 20, y: 22 },
            { type: OBJECT_TYPE.STEEL, x: 20, y: 23 },
            { type: OBJECT_TYPE.STEEL, x: 20, y: 24 },
            { type: OBJECT_TYPE.STEEL, x: 20, y: 25 },
            
            // 左上角复杂迷宫
            { type: OBJECT_TYPE.BRICK, x: 5, y: 5 },
            { type: OBJECT_TYPE.BRICK, x: 6, y: 5 },
            { type: OBJECT_TYPE.BRICK, x: 7, y: 5 },
            { type: OBJECT_TYPE.BRICK, x: 8, y: 5 },
            { type: OBJECT_TYPE.BRICK, x: 9, y: 5 },
            { type: OBJECT_TYPE.BRICK, x: 5, y: 6 },
            { type: OBJECT_TYPE.BRICK, x: 9, y: 6 },
            { type: OBJECT_TYPE.BRICK, x: 5, y: 7 },
            { type: OBJECT_TYPE.BRICK, x: 7, y: 7 },
            { type: OBJECT_TYPE.BRICK, x: 9, y: 7 },
            { type: OBJECT_TYPE.BRICK, x: 5, y: 8 },
            { type: OBJECT_TYPE.BRICK, x: 7, y: 8 },
            { type: OBJECT_TYPE.BRICK, x: 9, y: 8 },
            { type: OBJECT_TYPE.BRICK, x: 5, y: 9 },
            { type: OBJECT_TYPE.BRICK, x: 6, y: 9 },
            { type: OBJECT_TYPE.BRICK, x: 7, y: 9 },
            { type: OBJECT_TYPE.BRICK, x: 8, y: 9 },
            { type: OBJECT_TYPE.BRICK, x: 9, y: 9 },
            
            // 右上角砖墙区域
            { type: OBJECT_TYPE.BRICK, x: 30, y: 5 },
            { type: OBJECT_TYPE.BRICK, x: 31, y: 5 },
            { type: OBJECT_TYPE.BRICK, x: 32, y: 5 },
            { type: OBJECT_TYPE.BRICK, x: 33, y: 5 },
            { type: OBJECT_TYPE.BRICK, x: 34, y: 5 },
            { type: OBJECT_TYPE.BRICK, x: 30, y: 6 },
            { type: OBJECT_TYPE.BRICK, x: 34, y: 6 },
            { type: OBJECT_TYPE.BRICK, x: 30, y: 7 },
            { type: OBJECT_TYPE.BRICK, x: 32, y: 7 },
            { type: OBJECT_TYPE.BRICK, x: 34, y: 7 },
            { type: OBJECT_TYPE.BRICK, x: 30, y: 8 },
            { type: OBJECT_TYPE.BRICK, x: 31, y: 8 },
            { type: OBJECT_TYPE.BRICK, x: 32, y: 8 },
            { type: OBJECT_TYPE.BRICK, x: 33, y: 8 },
            { type: OBJECT_TYPE.BRICK, x: 34, y: 8 },
            
            // 左下区域水域障碍
            { type: OBJECT_TYPE.WATER, x: 5, y: 28 },
            { type: OBJECT_TYPE.WATER, x: 6, y: 28 },
            { type: OBJECT_TYPE.WATER, x: 7, y: 28 },
            { type: OBJECT_TYPE.WATER, x: 8, y: 28 },
            { type: OBJECT_TYPE.WATER, x: 9, y: 28 },
            { type: OBJECT_TYPE.WATER, x: 5, y: 29 },
            { type: OBJECT_TYPE.WATER, x: 6, y: 29 },
            { type: OBJECT_TYPE.WATER, x: 7, y: 29 },
            { type: OBJECT_TYPE.WATER, x: 8, y: 29 },
            { type: OBJECT_TYPE.WATER, x: 9, y: 29 },
            { type: OBJECT_TYPE.WATER, x: 5, y: 30 },
            { type: OBJECT_TYPE.WATER, x: 6, y: 30 },
            { type: OBJECT_TYPE.WATER, x: 7, y: 30 },
            { type: OBJECT_TYPE.WATER, x: 8, y: 30 },
            { type: OBJECT_TYPE.WATER, x: 9, y: 30 },
            
            // 右下草地区域
            { type: OBJECT_TYPE.GRASS, x: 30, y: 28 },
            { type: OBJECT_TYPE.GRASS, x: 31, y: 28 },
            { type: OBJECT_TYPE.GRASS, x: 32, y: 28 },
            { type: OBJECT_TYPE.GRASS, x: 33, y: 28 },
            { type: OBJECT_TYPE.GRASS, x: 34, y: 28 },
            { type: OBJECT_TYPE.GRASS, x: 30, y: 29 },
            { type: OBJECT_TYPE.GRASS, x: 31, y: 29 },
            { type: OBJECT_TYPE.GRASS, x: 32, y: 29 },
            { type: OBJECT_TYPE.GRASS, x: 33, y: 29 },
            { type: OBJECT_TYPE.GRASS, x: 34, y: 29 },
            { type: OBJECT_TYPE.GRASS, x: 30, y: 30 },
            { type: OBJECT_TYPE.GRASS, x: 31, y: 30 },
            { type: OBJECT_TYPE.GRASS, x: 32, y: 30 },
            { type: OBJECT_TYPE.GRASS, x: 33, y: 30 },
            { type: OBJECT_TYPE.GRASS, x: 34, y: 30 },
            
            // 中央区域随机墙
            { type: OBJECT_TYPE.BRICK, x: 15, y: 12 },
            { type: OBJECT_TYPE.BRICK, x: 16, y: 12 },
            { type: OBJECT_TYPE.BRICK, x: 24, y: 12 },
            { type: OBJECT_TYPE.BRICK, x: 25, y: 12 },
            
            { type: OBJECT_TYPE.STEEL, x: 10, y: 18 },
            { type: OBJECT_TYPE.STEEL, x: 11, y: 18 },
            { type: OBJECT_TYPE.STEEL, x: 29, y: 18 },
            { type: OBJECT_TYPE.STEEL, x: 30, y: 18 },
            
            { type: OBJECT_TYPE.BRICK, x: 15, y: 26 },
            { type: OBJECT_TYPE.BRICK, x: 16, y: 26 },
            { type: OBJECT_TYPE.BRICK, x: 24, y: 26 },
            { type: OBJECT_TYPE.BRICK, x: 25, y: 26 }
        ],
        enemyCount: 25, // 增加敌人总数
        specialRules: {
            timeLimit: 180, // 180秒限时
            randomWalls: true, // 随机生成/消失墙壁
            teleport: true // 能量瞬移能力
        }
    },
    // 关卡3: 钢铁迷宫
    {
        name: "钢铁迷宫",
        playerStart: { x: 2, y: 35 }, // 左下角
        basePosition: { x: 20, y: 37 }, // 修正为中央底部，与其他关卡保持一致
        enemies: [
            { type: "basic", x: 20, y: 1, direction: DOWN },
            { type: "fast", x: 38, y: 1, direction: DOWN },
            { type: "armor", x: 1, y: 1, direction: DOWN },
            { type: "fast", x: 10, y: 10, direction: DOWN },
            { type: "armor", x: 30, y: 10, direction: DOWN }
        ],
        map: [
            // 移除右上角老鹰保护区，添加底部中央老鹰保护区
            // 老鹰周围的保护墙 - 与前两关相似的U型结构
            { type: OBJECT_TYPE.BRICK, x: 19, y: 36 },
            { type: OBJECT_TYPE.BRICK, x: 20, y: 36 },
            { type: OBJECT_TYPE.BRICK, x: 21, y: 36 },
            { type: OBJECT_TYPE.BRICK, x: 22, y: 36 },
            
            { type: OBJECT_TYPE.BRICK, x: 19, y: 37 }, // 左边下部
            { type: OBJECT_TYPE.BRICK, x: 22, y: 37 }, // 右边下部
            
            { type: OBJECT_TYPE.BRICK, x: 19, y: 38 }, // 左底角
            { type: OBJECT_TYPE.BRICK, x: 22, y: 38 }, // 右底角

            // 其他原有的迷宫元素保持不变
            // 迷宫主干道（钢墙）
            { type: OBJECT_TYPE.STEEL, x: 5, y: 5 },
            { type: OBJECT_TYPE.STEEL, x: 6, y: 5 },
            { type: OBJECT_TYPE.STEEL, x: 7, y: 5 },
            { type: OBJECT_TYPE.STEEL, x: 8, y: 5 },
            { type: OBJECT_TYPE.STEEL, x: 9, y: 5 },
            { type: OBJECT_TYPE.STEEL, x: 10, y: 5 },
            { type: OBJECT_TYPE.STEEL, x: 11, y: 5 },
            { type: OBJECT_TYPE.STEEL, x: 12, y: 5 },
            { type: OBJECT_TYPE.STEEL, x: 13, y: 5 },
            { type: OBJECT_TYPE.STEEL, x: 14, y: 5 },
            { type: OBJECT_TYPE.STEEL, x: 15, y: 5 },
            { type: OBJECT_TYPE.STEEL, x: 16, y: 5 },
            { type: OBJECT_TYPE.STEEL, x: 17, y: 5 },
            { type: OBJECT_TYPE.STEEL, x: 18, y: 5 },
            { type: OBJECT_TYPE.STEEL, x: 19, y: 5 },
            { type: OBJECT_TYPE.STEEL, x: 20, y: 5 },
            { type: OBJECT_TYPE.STEEL, x: 21, y: 5 },
            { type: OBJECT_TYPE.STEEL, x: 22, y: 5 },
            { type: OBJECT_TYPE.STEEL, x: 23, y: 5 },
            { type: OBJECT_TYPE.STEEL, x: 24, y: 5 },
            { type: OBJECT_TYPE.STEEL, x: 25, y: 5 },
            { type: OBJECT_TYPE.STEEL, x: 26, y: 5 },
            { type: OBJECT_TYPE.STEEL, x: 27, y: 5 },
            { type: OBJECT_TYPE.STEEL, x: 28, y: 5 },
            { type: OBJECT_TYPE.STEEL, x: 29, y: 5 },
            { type: OBJECT_TYPE.STEEL, x: 30, y: 5 },
            { type: OBJECT_TYPE.STEEL, x: 31, y: 5 },
            { type: OBJECT_TYPE.STEEL, x: 32, y: 5 },
            { type: OBJECT_TYPE.STEEL, x: 33, y: 5 },
            { type: OBJECT_TYPE.STEEL, x: 34, y: 5 },

            // 竖直钢墙迷宫
            { type: OBJECT_TYPE.STEEL, x: 10, y: 10 },
            { type: OBJECT_TYPE.STEEL, x: 10, y: 11 },
            { type: OBJECT_TYPE.STEEL, x: 10, y: 12 },
            { type: OBJECT_TYPE.STEEL, x: 10, y: 13 },
            { type: OBJECT_TYPE.STEEL, x: 10, y: 14 },
            { type: OBJECT_TYPE.STEEL, x: 10, y: 15 },
            { type: OBJECT_TYPE.STEEL, x: 10, y: 16 },
            { type: OBJECT_TYPE.STEEL, x: 10, y: 17 },
            { type: OBJECT_TYPE.STEEL, x: 10, y: 18 },
            { type: OBJECT_TYPE.STEEL, x: 10, y: 19 },
            { type: OBJECT_TYPE.STEEL, x: 10, y: 20 },
            { type: OBJECT_TYPE.STEEL, x: 10, y: 21 },
            { type: OBJECT_TYPE.STEEL, x: 10, y: 22 },
            { type: OBJECT_TYPE.STEEL, x: 10, y: 23 },
            { type: OBJECT_TYPE.STEEL, x: 10, y: 24 },
            { type: OBJECT_TYPE.STEEL, x: 10, y: 25 },
            { type: OBJECT_TYPE.STEEL, x: 10, y: 26 },
            { type: OBJECT_TYPE.STEEL, x: 10, y: 27 },
            { type: OBJECT_TYPE.STEEL, x: 10, y: 28 },
            { type: OBJECT_TYPE.STEEL, x: 10, y: 29 },
            { type: OBJECT_TYPE.STEEL, x: 10, y: 30 },

            { type: OBJECT_TYPE.STEEL, x: 30, y: 10 },
            { type: OBJECT_TYPE.STEEL, x: 30, y: 11 },
            { type: OBJECT_TYPE.STEEL, x: 30, y: 12 },
            { type: OBJECT_TYPE.STEEL, x: 30, y: 13 },
            { type: OBJECT_TYPE.STEEL, x: 30, y: 14 },
            { type: OBJECT_TYPE.STEEL, x: 30, y: 15 },
            { type: OBJECT_TYPE.STEEL, x: 30, y: 16 },
            { type: OBJECT_TYPE.STEEL, x: 30, y: 17 },
            { type: OBJECT_TYPE.STEEL, x: 30, y: 18 },
            { type: OBJECT_TYPE.STEEL, x: 30, y: 19 },
            { type: OBJECT_TYPE.STEEL, x: 30, y: 20 },
            { type: OBJECT_TYPE.STEEL, x: 30, y: 21 },
            { type: OBJECT_TYPE.STEEL, x: 30, y: 22 },
            { type: OBJECT_TYPE.STEEL, x: 30, y: 23 },
            { type: OBJECT_TYPE.STEEL, x: 30, y: 24 },
            { type: OBJECT_TYPE.STEEL, x: 30, y: 25 },
            { type: OBJECT_TYPE.STEEL, x: 30, y: 26 },
            { type: OBJECT_TYPE.STEEL, x: 30, y: 27 },
            { type: OBJECT_TYPE.STEEL, x: 30, y: 28 },
            { type: OBJECT_TYPE.STEEL, x: 30, y: 29 },
            { type: OBJECT_TYPE.STEEL, x: 30, y: 30 },

            // 水域障碍
            { type: OBJECT_TYPE.WATER, x: 15, y: 15 },
            { type: OBJECT_TYPE.WATER, x: 16, y: 15 },
            { type: OBJECT_TYPE.WATER, x: 17, y: 15 },
            { type: OBJECT_TYPE.WATER, x: 18, y: 15 },
            { type: OBJECT_TYPE.WATER, x: 19, y: 15 },
            { type: OBJECT_TYPE.WATER, x: 20, y: 15 },
            { type: OBJECT_TYPE.WATER, x: 21, y: 15 },
            { type: OBJECT_TYPE.WATER, x: 22, y: 15 },
            { type: OBJECT_TYPE.WATER, x: 23, y: 15 },
            { type: OBJECT_TYPE.WATER, x: 24, y: 15 },
            { type: OBJECT_TYPE.WATER, x: 25, y: 15 },
            { type: OBJECT_TYPE.WATER, x: 26, y: 15 },
            { type: OBJECT_TYPE.WATER, x: 27, y: 15 },
            { type: OBJECT_TYPE.WATER, x: 28, y: 15 },
            { type: OBJECT_TYPE.WATER, x: 29, y: 15 },
            { type: OBJECT_TYPE.WATER, x: 15, y: 16 },
            { type: OBJECT_TYPE.WATER, x: 15, y: 17 },
            { type: OBJECT_TYPE.WATER, x: 15, y: 18 },
            { type: OBJECT_TYPE.WATER, x: 15, y: 19 },
            { type: OBJECT_TYPE.WATER, x: 15, y: 20 },
            { type: OBJECT_TYPE.WATER, x: 15, y: 21 },
            { type: OBJECT_TYPE.WATER, x: 15, y: 22 },
            { type: OBJECT_TYPE.WATER, x: 15, y: 23 },
            { type: OBJECT_TYPE.WATER, x: 15, y: 24 },
            { type: OBJECT_TYPE.WATER, x: 15, y: 25 },
            { type: OBJECT_TYPE.WATER, x: 15, y: 26 },
            { type: OBJECT_TYPE.WATER, x: 15, y: 27 },
            { type: OBJECT_TYPE.WATER, x: 15, y: 28 },
            { type: OBJECT_TYPE.WATER, x: 15, y: 29 },
            { type: OBJECT_TYPE.WATER, x: 15, y: 30 },

            // 迷宫内草地
            { type: OBJECT_TYPE.GRASS, x: 12, y: 12 },
            { type: OBJECT_TYPE.GRASS, x: 13, y: 13 },
            { type: OBJECT_TYPE.GRASS, x: 14, y: 14 },
            { type: OBJECT_TYPE.GRASS, x: 16, y: 18 },
            { type: OBJECT_TYPE.GRASS, x: 18, y: 16 },
            { type: OBJECT_TYPE.GRASS, x: 20, y: 20 },
            { type: OBJECT_TYPE.GRASS, x: 22, y: 18 },
            { type: OBJECT_TYPE.GRASS, x: 18, y: 22 },
            { type: OBJECT_TYPE.GRASS, x: 28, y: 28 },
            { type: OBJECT_TYPE.GRASS, x: 29, y: 29 },
            { type: OBJECT_TYPE.GRASS, x: 30, y: 30 },
            // 添加通向老鹰的保护区
            { type: OBJECT_TYPE.STEEL, x: 18, y: 27 },
            { type: OBJECT_TYPE.STEEL, x: 22, y: 27 },
            { type: OBJECT_TYPE.STEEL, x: 18, y: 28 },
            { type: OBJECT_TYPE.STEEL, x: 22, y: 28 },
        ],
        enemyCount: 30,
        specialRules: {
            timeLimit: 240, // 240秒限时
            randomWalls: false,
            teleport: false
        }
    }
];

// 游戏主类
class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.gameOver = false;
        this.paused = false;
        
        // 从URL参数中获取初始关卡
        const urlParams = new URLSearchParams(window.location.search);
        const levelParam = urlParams.get('level');
        // 如果URL中有level参数，且在有效范围内，则使用该关卡
        if (levelParam && !isNaN(parseInt(levelParam))) {
            const requestedLevel = parseInt(levelParam);
            if (requestedLevel >= 1 && requestedLevel <= levelData.length) {
                this.currentLevel = requestedLevel;
            } else {
                this.currentLevel = 1; // 默认关卡
            }
        } else {
            this.currentLevel = 1; // 默认关卡
        }
        
        this.score = 0;
        this.playerLives = 3;
        this.enemies = [];
        this.bullets = [];
        this.explosions = []; // 初始化爆炸效果数组
        this.map = [];
        this.keyState = {}; // 跟踪按键状态
        this.lastTimestamp = 0;
        this.player = null;
        this.enemiesLeft = 0;
        this.enemiesGenerated = 0; // 跟踪已生成的敌人数量
        this.animationCounter = 0; // 用于水域动画
        
        this.loadingScreen = document.getElementById('loadingScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.gameWinScreen = document.getElementById('gameWinScreen');
        this.pauseScreen = document.getElementById('pauseScreen');
        
        // 初始化重启按钮
        document.getElementById('restartButton').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('nextLevelButton').addEventListener('click', () => {
            this.startNextLevel();
        });
        
        // 添加关卡选择器
        this.createLevelSelector();
        
        this.setupKeyboardControls();
        this.loadSprites();
    }
    
    // 加载游戏图片资源
    loadSprites() {
        this.sprites = new Image();
        this.sprites.src = 'assets/images/tankAll.gif';
        this.sprites.onload = () => {
            this.startGame();
        };
    }
    
    // 设置键盘控制
    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            this.keyState[e.code] = true;

            // 阻止浏览器对方向键/空格等的默认行为，避免焦点在下拉框时箭头改变选项
            if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) {
                e.preventDefault();
            }
            
            // 暂停游戏
            if (e.code === 'KeyP') {
                this.togglePause();
            }
        }, { passive: false });
        
        document.addEventListener('keyup', (e) => {
            this.keyState[e.code] = false;
            if (e.code === 'Space') {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    // 切换游戏暂停状态
    togglePause() {
        this.paused = !this.paused;
        
        // 显示或隐藏暂停界面
        if (this.paused) {
            this.pauseScreen.style.display = 'flex';
        } else {
            this.pauseScreen.style.display = 'none';
            requestAnimationFrame(this.gameLoop.bind(this));
        }
    }
    
    // 开始游戏
    startGame() {
        this.initLevel(this.currentLevel);
        this.showLoading();
        
        setTimeout(() => {
            this.hideLoading();
            this.gameLoop(0);
        }, 2000);
    }
    
    // 初始化关卡
    initLevel(levelIndex) {
        const level = levelData[levelIndex - 1];
        if (!level) {
            console.error('关卡不存在:', levelIndex);
            return;
        }
        
        this.gameOver = false;
        this.paused = false; // 确保游戏开始时不是暂停状态
        this.map = [];
        this.enemies = [];
        this.bullets = [];
        this.explosions = []; // 初始化爆炸效果数组
        this.enemiesLeft = level.enemyCount;
        this.enemiesGenerated = 0; // 重置已生成的敌人数量
        
        // 隐藏所有界面
        this.gameOverScreen.style.display = 'none';
        this.gameWinScreen.style.display = 'none';
        this.pauseScreen.style.display = 'none';
        
        // 更新UI
        document.getElementById('current-level').textContent = levelIndex;
        document.getElementById('stage-number').textContent = levelIndex;
        document.getElementById('enemies-left').textContent = this.enemiesLeft;
        document.getElementById('player-lives').textContent = this.playerLives;
        document.getElementById('player-score').textContent = this.score;
        
        // 更新关卡名称显示
        this.updateLevelNameDisplay();
        
        // 创建地图
        this.createMap(level);
        
        // 初始化玩家坦克 - 确保坦克位置对齐到网格
        this.player = new Tank(
            level.playerStart.x * GRID_SIZE, // 使用准确位置
            level.playerStart.y * GRID_SIZE,
            UP,
            OBJECT_TYPE.PLAYER,
            true
        );
        
        // 初始化敌人坦克
        this.initEnemies(level);
        
        // 启动敌人生成器
        this.startEnemyGenerator(level);
        
        // 创建敌人图标
        this.updateEnemyIcons();
    }
    
    // 创建游戏地图
    createMap(level) {
        // 基于level.map创建实际的游戏地图
        if (level.map && level.map.length > 0) {
            level.map.forEach(item => {
                this.map.push(new Wall(item.x * GRID_SIZE, item.y * GRID_SIZE, item.type));
            });
        }
        
        // 简化实现：围绕地图边缘创建钢墙
        for (let x = 0; x < GRID_COUNT; x++) {
            for (let y = 0; y < GRID_COUNT; y++) {
                if (x === 0 || x === GRID_COUNT - 1 || y === 0 || y === GRID_COUNT - 1) {
                    this.map.push(new Wall(x * GRID_SIZE, y * GRID_SIZE, OBJECT_TYPE.STEEL));
                }
            }
        }
        
        // 创建基地并周围加保护墙
        const baseX = level.basePosition.x;
        const baseY = level.basePosition.y;
        
        // 基地位置使用实际像素坐标，无需乘以网格尺寸
        this.base = new Base(baseX * GRID_SIZE, baseY * GRID_SIZE);
        
        // 如果地图没有指定基地周围的保护墙，则不添加默认的
        // 所有关卡都在map中定义了老鹰周围的墙
    }
    
    // 初始化敌人坦克
    initEnemies(level) {
        // 先创建初始敌人
        level.enemies.forEach(enemy => {
            const tank = new Tank(
                enemy.x * GRID_SIZE, // 使用准确位置
                enemy.y * GRID_SIZE,
                enemy.direction,
                OBJECT_TYPE.ENEMY,
                false,
                enemy.type,
                enemy // 传递敌人特殊属性数据
            );
            
            // 应用关卡特殊规则
            if (level.specialRules) {
                this.applySpecialRules(tank, level.specialRules);
            }
            
            this.enemies.push(tank);
            this.enemiesGenerated++; // 将初始敌人计入已生成数量
        });
        
        // 更新剩余敌人数量
        this.enemiesLeft = level.enemyCount - this.enemiesGenerated + this.enemies.length;
        this.updateEnemyIcons();
    }
    
    // 应用关卡特殊规则到坦克
    applySpecialRules(tank, specialRules) {
        if (!tank.isPlayer) { // 只对敌人坦克应用特殊规则
            // 敌人减速规则
            if (specialRules.enemySlowdown) {
                tank.speed *= specialRules.enemySlowdown;
                tank.maxShootCooldown *= (1 / specialRules.enemySlowdown); // 射击冷却时间相应增加
            }
            
            // 训练模式规则
            if (specialRules.trainingMode) {
                // 在训练模式下，敌人行为更简单
                tank.speed *= 0.8; // 进一步降低速度
                tank.maxShootCooldown *= 1.5; // 射击频率降低
            }
            
            // 时间限制规则（全局规则，不直接应用到单个坦克）
            if (specialRules.timeLimit) {
                // 时间限制是全局规则，在游戏主循环中处理
            }
            
            // 随机墙壁规则（全局规则，不直接应用到单个坦克）
            if (specialRules.randomWalls) {
                // 随机墙壁是全局规则，在游戏主循环中处理
            }
        }
    }
    
    // 启动敌人生成器
    startEnemyGenerator(level) {
        // 清除旧的定时器（如果有）
        if (this.enemyGeneratorTimer) {
            clearInterval(this.enemyGeneratorTimer);
        }
        
        // 每隔几秒生成一个新敌人
        this.enemyGeneratorTimer = setInterval(() => {
            // 如果游戏结束，停止生成
            if (this.gameOver) {
                clearInterval(this.enemyGeneratorTimer);
                return;
            }
            
            // 如果已生成所有敌人，停止生成
            if (this.enemiesGenerated >= level.enemyCount) {
                clearInterval(this.enemyGeneratorTimer);
                return;
            }
            
            // 如果当前场上敌人达到上限，等待下次检查
            if (this.enemies.length >= 6) {
                return;
            }
            
            // 随机选择生成位置
            const spawnPositions = [
                { x: 1, y: 1 },
                { x: 20, y: 1 },
                { x: 37, y: 1 }
            ];
            const pos = spawnPositions[Math.floor(Math.random() * spawnPositions.length)];
            
            // 随机选择坦克类型
            let tankType;
            
            // 在第2关提高armor类型坦克的生成概率
            if (this.currentLevel === 2) {
                // 60%概率生成armor坦克，30%生成fast坦克，10%生成basic坦克
                const rnd = Math.random();
                if (rnd < 0.6) {
                    tankType = "armor"; // 绿色追踪坦克
                } else if (rnd < 0.9) {
                    tankType = "fast";
                } else {
                    tankType = "basic";
                }
            } else {
                // 其他关卡正常随机
                const tankTypes = ["basic", "fast", "armor"];
                tankType = tankTypes[Math.floor(Math.random() * tankTypes.length)];
            }
            
            // 创建新敌人坦克
            const newEnemy = new Tank(
                pos.x * GRID_SIZE,
                pos.y * GRID_SIZE,
                DOWN,
                OBJECT_TYPE.ENEMY,
                false,
                tankType
            );
            
            // 添加到敌人数组
            this.enemies.push(newEnemy);
            this.enemiesGenerated++;
            
            // 计算并更新UI显示的剩余敌人数量
            this.enemiesLeft = level.enemyCount - this.enemiesGenerated + this.enemies.length;
            this.updateEnemyIcons();
        }, 3000); // 每3秒生成一个敌人
    }
    
    // 更新敌人图标
    updateEnemyIcons() {
        const container = document.getElementById('enemy-tanks-container');
        container.innerHTML = '';
        
        // 计算剩余敌人总数
        const remainingEnemies = Math.max(0, this.enemiesLeft);
        
        // 限制显示的敌人图标数量，最多显示28个（两行）
        // 如果敌人数量多于28个，则只显示图标数量，不显示所有图标
        const maxIconsToShow = this.enemiesLeft > 28 ? 0 : remainingEnemies;
        
        for (let i = 0; i < maxIconsToShow; i++) {
            const icon = document.createElement('div');
            icon.className = 'enemy-tank';
            container.appendChild(icon);
            
            // 每行最多14个图标
            if ((i + 1) % 14 === 0) {
                container.appendChild(document.createElement('br'));
            }
        }
        
        // 更新敌人数量文本
        document.getElementById('enemies-left').textContent = remainingEnemies;
    }
    
    // 显示加载屏幕
    showLoading() {
        this.loadingScreen.style.display = 'flex';
        
        // 更新关卡信息
        const level = levelData[this.currentLevel - 1];
        if (level) {
            document.getElementById('stage-number').textContent = this.currentLevel;
            // 查找并更新关卡名称元素
            const levelNameElement = this.loadingScreen.querySelector('div:nth-child(2)');
            if (levelNameElement) {
                levelNameElement.textContent = level.name;
            }
        }
    }
    
    // 隐藏加载屏幕
    hideLoading() {
        this.loadingScreen.style.display = 'none';
    }
    
    // 游戏主循环
    gameLoop(timestamp) {
        if (this.paused) return;
        
        const deltaTime = timestamp - this.lastTimestamp;
        this.lastTimestamp = timestamp;
        
        this.update(deltaTime);
        this.render();
        
        if (!this.gameOver) {
            requestAnimationFrame(this.gameLoop.bind(this));
        }
    }
    
    // 更新游戏状态
    update(deltaTime) {
        if (this.gameOver) return;
        
        // 动画计数器（用于水域动画等）
        this.animationCounter += deltaTime;
        if (this.animationCounter > 500) {
            this.animationCounter = 0;
        }
        
        // 处理玩家输入
        this.handlePlayerInput();
        
        // 更新技能冷却UI
        if (this.player && this.skillUI) {
            this.updateSkillCooldownUI();
        }
        
        // 更新玩家坦克
        this.player.update(deltaTime, this.map, this.enemies, this.base);
        
        // 更新敌人坦克
        this.enemies.forEach(enemy => {
            enemy.update(deltaTime, this.map, [this.player], this.base);
            
            // AI决策
            this.updateEnemyAI(enemy, deltaTime);
        });
        
        // 更新子弹
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            const result = bullet.update(deltaTime, this.map, bullet.isPlayer ? this.enemies : [this.player], this.base);
            
            if (result.destroyed) {
                this.bullets.splice(i, 1);
            }
            
            if (result.hitTarget) {
                // 处理击中目标的情况
                this.handleBulletHit(bullet, result);
            }
        }
        
        // 更新爆炸效果
        if (this.explosions) {
            for (let i = this.explosions.length - 1; i >= 0; i--) {
                // 如果爆炸动画结束，则移除爆炸效果
                if (this.explosions[i].update(deltaTime)) {
                    this.explosions.splice(i, 1);
                }
            }
        }
        
        // 只有当已经生成了一些敌人后才检查胜利条件
        if (this.enemiesGenerated > 0) {
            this.checkVictory();
        }
    }
    
    // 处理玩家输入
    handlePlayerInput() {
        // 移动方向控制（支持方向键与WASD）
        const up = this.keyState['ArrowUp'] || this.keyState['KeyW'];
        const down = this.keyState['ArrowDown'] || this.keyState['KeyS'];
        const left = this.keyState['ArrowLeft'] || this.keyState['KeyA'];
        const right = this.keyState['ArrowRight'] || this.keyState['KeyD'];

        if (up) {
            this.player.move(UP);
        } else if (right) {
            this.player.move(RIGHT);
        } else if (down) {
            this.player.move(DOWN);
        } else if (left) {
            this.player.move(LEFT);
        } else {
            this.player.stopMoving();
        }
        
        // 射击控制
        if (this.keyState['Space']) {
            const bullet = this.player.shoot();
            if (bullet) {
                this.bullets.push(bullet);
            }
        }
        
        // 特殊技能1: 超级炮弹 (Z键)
        if (this.keyState['KeyZ']) {
            const superBullet = this.player.shootSuperBullet();
            if (superBullet) {
                this.bullets.push(superBullet);
                this.playSpecialSound('superBullet');
            }
        }
        
        // 特殊技能2: 闪现冲刺 (X键)
        if (this.keyState['KeyX']) {
            if (this.player.dash()) {
                this.playSpecialSound('dash');
            }
        }
        
        // 更新技能冷却UI
        this.updateSkillCooldownUI();
    }
    
    // 更新技能冷却UI
    updateSkillCooldownUI() {
        // 如果UI元素不存在，创建它们
        if (!this.skillUI) {
            this.createSkillUI();
        }
        
        // 更新超级炮弹冷却显示
        const superBulletCooldownPercent = Math.max(0, this.player.superBulletCooldown / this.player.maxSuperBulletCooldown);
        this.skillUI.superBulletCooldown.style.height = (superBulletCooldownPercent * 100) + '%';
        
        // 更新闪现冲刺冷却显示
        const dashCooldownPercent = Math.max(0, this.player.dashCooldown / this.player.maxDashCooldown);
        this.skillUI.dashCooldown.style.height = (dashCooldownPercent * 100) + '%';
        
        // 更新文字提示
        this.skillUI.superBulletText.textContent = superBulletCooldownPercent > 0 
            ? Math.ceil(this.player.superBulletCooldown / 1000) + 's' 
            : '就绪';
        this.skillUI.dashText.textContent = dashCooldownPercent > 0 
            ? Math.ceil(this.player.dashCooldown / 1000) + 's' 
            : '就绪';
    }
    
    // 创建技能UI
    createSkillUI() {
        this.skillUI = {};
        
        // 创建技能UI容器
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.bottom = '10px';
        container.style.right = '10px';
        container.style.display = 'flex';
        container.style.gap = '10px';
        container.style.zIndex = '1000';
        
        // 创建超级炮弹UI
        const superBulletUI = document.createElement('div');
        superBulletUI.style.display = 'flex';
        superBulletUI.style.flexDirection = 'column';
        superBulletUI.style.alignItems = 'center';
        
        const superBulletLabel = document.createElement('div');
        superBulletLabel.textContent = '超级炮弹 [Z]';
        superBulletLabel.style.color = 'white';
        superBulletLabel.style.fontSize = '12px';
        superBulletLabel.style.marginBottom = '5px';
        
        const superBulletBar = document.createElement('div');
        superBulletBar.style.width = '30px';
        superBulletBar.style.height = '80px';
        superBulletBar.style.border = '2px solid #ff3333';
        superBulletBar.style.borderRadius = '5px';
        superBulletBar.style.position = 'relative';
        superBulletBar.style.overflow = 'hidden';
        
        const superBulletCooldown = document.createElement('div');
        superBulletCooldown.style.position = 'absolute';
        superBulletCooldown.style.bottom = '0';
        superBulletCooldown.style.width = '100%';
        superBulletCooldown.style.height = '0%';
        superBulletCooldown.style.backgroundColor = '#ff3333';
        superBulletCooldown.style.transition = 'height 0.1s linear';
        
        const superBulletText = document.createElement('div');
        superBulletText.textContent = '就绪';
        superBulletText.style.color = 'white';
        superBulletText.style.fontSize = '12px';
        superBulletText.style.marginTop = '5px';
        
        superBulletBar.appendChild(superBulletCooldown);
        superBulletUI.appendChild(superBulletLabel);
        superBulletUI.appendChild(superBulletBar);
        superBulletUI.appendChild(superBulletText);
        
        // 创建闪现冲刺UI
        const dashUI = document.createElement('div');
        dashUI.style.display = 'flex';
        dashUI.style.flexDirection = 'column';
        dashUI.style.alignItems = 'center';
        
        const dashLabel = document.createElement('div');
        dashLabel.textContent = '闪现冲刺 [X]';
        dashLabel.style.color = 'white';
        dashLabel.style.fontSize = '12px';
        dashLabel.style.marginBottom = '5px';
        
        const dashBar = document.createElement('div');
        dashBar.style.width = '30px';
        dashBar.style.height = '80px';
        dashBar.style.border = '2px solid #00ffff';
        dashBar.style.borderRadius = '5px';
        dashBar.style.position = 'relative';
        dashBar.style.overflow = 'hidden';
        
        const dashCooldown = document.createElement('div');
        dashCooldown.style.position = 'absolute';
        dashCooldown.style.bottom = '0';
        dashCooldown.style.width = '100%';
        dashCooldown.style.height = '0%';
        dashCooldown.style.backgroundColor = '#00ffff';
        dashCooldown.style.transition = 'height 0.1s linear';
        
        const dashText = document.createElement('div');
        dashText.textContent = '就绪';
        dashText.style.color = 'white';
        dashText.style.fontSize = '12px';
        dashText.style.marginTop = '5px';
        
        dashBar.appendChild(dashCooldown);
        dashUI.appendChild(dashLabel);
        dashUI.appendChild(dashBar);
        dashUI.appendChild(dashText);
        
        // 将UI元素添加到容器中
        container.appendChild(superBulletUI);
        container.appendChild(dashUI);
        
        // 将容器添加到页面
        document.body.appendChild(container);
        
        // 保存UI引用
        this.skillUI = {
            container: container,
            superBulletCooldown: superBulletCooldown,
            superBulletText: superBulletText,
            dashCooldown: dashCooldown,
            dashText: dashText
        };
    }
    
    // 播放特殊技能音效
    playSpecialSound(skillType) {
        // 由于没有实际的音效资源，这里只是预留接口
        // 如果有音效系统，可以在这里播放相应的音效
        console.log(`播放${skillType}音效`);
    }
    
    // 更新敌人AI
    updateEnemyAI(enemy, deltaTime) {
        // 简单AI实现
        enemy.aiTimer = (enemy.aiTimer || 0) + deltaTime;
        
        // 射击冷却
        enemy.aiShootTimer = (enemy.aiShootTimer || 0) + deltaTime;
        
        // 特殊敌人类型处理
        if (enemy.isStatic) {
            // 固定炮台：不移动，只射击
            this.updateStaticTurretAI(enemy);
        } else if (enemy.patrolPath && enemy.patrolPath.length > 0) {
            // 巡逻坦克：按预定路径移动
            this.updatePatrolTankAI(enemy, deltaTime);
        } else if (this.currentLevel === 2 && enemy.tankType === 'armor') {
            // 第2关的装甲坦克(绿色坦克)具有追踪玩家的能力
            this.updateArmorTankAI(enemy);
        } else {
            // 标准AI：每2秒改变一次行动
            if (enemy.aiTimer >= 2000) {
                enemy.aiTimer = 0;
                
                // 随机决策：移动、射击或转向
                const decision = Math.random();
                
                if (decision < 0.7) {
                    // 随机转向并移动
                    const directions = [UP, RIGHT, DOWN, LEFT];
                    const randomDirection = directions[Math.floor(Math.random() * directions.length)];
                    enemy.move(randomDirection);
                } else {
                    // 停止移动
                    enemy.stopMoving();
                }
            }
        }
        
        // 单独控制射击，每1-3秒尝试射击一次
        if (enemy.aiShootTimer >= 1000 + Math.random() * 2000) {
            enemy.aiShootTimer = 0;
            
            // 绿色坦克射击概率更高
            const shootChance = (this.currentLevel === 2 && enemy.tankType === 'armor') ? 0.9 : 0.7;
            
            // 概率射击
            if (Math.random() < shootChance) {
                const bullet = enemy.shoot();
                if (bullet) {
                    this.bullets.push(bullet);
                }
            }
        }
    }
    
    // 装甲坦克(绿色坦克)追踪玩家的AI
    updateArmorTankAI(enemy) {
        // 计算敌人和玩家之间的距离和方向
        const dx = this.player.x - enemy.x;
        const dy = this.player.y - enemy.y;
        
        // 每1.5秒更新一次追踪方向
        if (enemy.aiTimer >= 1500) {
            enemy.aiTimer = 0;
            
            // 决定是横向还是纵向追踪
            const preferHorizontal = Math.abs(dx) > Math.abs(dy);
            
            if (preferHorizontal) {
                // 横向移动
                if (dx > 0) {
                    enemy.move(RIGHT); // 玩家在右边
                } else {
                    enemy.move(LEFT);  // 玩家在左边
                }
            } else {
                // 纵向移动
                if (dy > 0) {
                    enemy.move(DOWN);  // 玩家在下边
                } else {
                    enemy.move(UP);    // 玩家在上边
                }
            }
            
            // 10%的概率随机移动，避免卡住
            if (Math.random() < 0.1) {
                const directions = [UP, RIGHT, DOWN, LEFT];
                const randomDirection = directions[Math.floor(Math.random() * directions.length)];
                enemy.move(randomDirection);
            }
        }
    }
    
    // 固定炮台AI：不移动，只射击
    updateStaticTurretAI(enemy) {
        // 固定炮台不移动，只保持当前方向
        enemy.stopMoving();
        
        // 每2-4秒射击一次
        if (enemy.aiShootTimer >= 2000 + Math.random() * 2000) {
            enemy.aiShootTimer = 0;
            const bullet = enemy.shoot();
            if (bullet) {
                this.bullets.push(bullet);
            }
        }
    }
    
    // 巡逻坦克AI：按预定路径移动
    updatePatrolTankAI(enemy, deltaTime) {
        // 更新巡逻计时器
        enemy.patrolTimer = (enemy.patrolTimer || 0) + deltaTime;
        
        // 每3秒移动到下一个巡逻点
        if (enemy.patrolTimer >= 3000) {
            enemy.patrolTimer = 0;
            
            // 移动到下一个巡逻点
            enemy.patrolIndex = (enemy.patrolIndex + 1) % enemy.patrolPath.length;
            const nextPoint = enemy.patrolPath[enemy.patrolIndex];
            
            // 设置新的位置和方向
            enemy.x = nextPoint.x * GRID_SIZE;
            enemy.y = nextPoint.y * GRID_SIZE;
            enemy.direction = nextPoint.direction;
            
            // 开始移动
            enemy.move(nextPoint.direction);
        }
        
        // 巡逻坦克射击频率较低，每4-6秒射击一次
        if (enemy.aiShootTimer >= 4000 + Math.random() * 2000) {
            enemy.aiShootTimer = 0;
            const bullet = enemy.shoot();
            if (bullet) {
                this.bullets.push(bullet);
            }
        }
    }
    
    // 处理子弹击中目标
    handleBulletHit(bullet, result) {
        if (result.hitTarget === this.player) {
            this.playerHit();
        } else if (result.hitTarget.type === OBJECT_TYPE.ENEMY) {
            // 击中敌人坦克
            this.enemyHit(result.hitTarget);
        } else if (result.hitTarget === this.base) {
            // 击中基地
            this.baseHit();
        } else if (result.hitWall) {
            // 击中墙壁
            this.wallHit(result.hitWall, bullet);
        }
    }
    
    // 玩家被击中
    playerHit() {
        this.playerLives--;
        document.getElementById('player-lives').textContent = this.playerLives;
        
        if (this.playerLives <= 0) {
            this.gameOver = true;
            this.showGameOver();
        } else {
            // 重置玩家位置
            const level = levelData[this.currentLevel - 1];
            this.player.x = level.playerStart.x * GRID_SIZE;
            this.player.y = level.playerStart.y * GRID_SIZE;
            this.player.direction = UP;
        }
    }
    
    // 敌人被击中
    enemyHit(enemy) {
        const index = this.enemies.indexOf(enemy);
        if (index !== -1) {
            // 播放坦克爆炸效果
            this.createExplosion(enemy.x, enemy.y);
            
            // 移除敌人
            this.enemies.splice(index, 1);
            this.score += 100; // 每击毁一个敌人得100分
            document.getElementById('player-score').textContent = this.score;
            
            // 更新剩余敌人数量 (总敌人数 - 已生成的 + 当前场上的)
            const totalEnemies = this.currentLevel > 0 ? levelData[this.currentLevel - 1].enemyCount : 0;
            this.enemiesLeft = Math.max(0, totalEnemies - this.enemiesGenerated + this.enemies.length);
            
            // 更新UI
            this.updateEnemyIcons();
        }
    }
    
    // 创建爆炸效果
    createExplosion(x, y) {
        // 创建爆炸对象
        const explosion = {
            x: x,
            y: y,
            frame: 0,
            maxFrames: 3, // 爆炸动画有3帧
            size: TANK_SIZE,
            update: (deltaTime) => {
                explosion.frame += 0.1; // 控制爆炸动画速度
                return explosion.frame >= explosion.maxFrames;
            },
            draw: (ctx, sprites) => {
                // 使用坦克爆炸的精灵图
                const spriteX = POS["tankBomb"][0];
                const spriteY = POS["tankBomb"][1];
                const frameWidth = 32;
                
                // 计算当前帧的位置
                const currentFrame = Math.floor(explosion.frame);
                
                ctx.drawImage(
                    sprites,
                    spriteX + currentFrame * frameWidth, spriteY,
                    frameWidth, frameWidth,
                    explosion.x, explosion.y,
                    explosion.size, explosion.size
                );
            }
        };
        
        // 将爆炸效果添加到游戏对象中
        if (!this.explosions) {
            this.explosions = [];
        }
        this.explosions.push(explosion);
    }
    
    // 基地被击中
    baseHit() {
        this.base.destroy();
        this.gameOver = true;
        this.showGameOver();
    }
    
    // 墙壁被击中
    wallHit(wall, bullet) {
        // 创建子弹爆炸效果
        this.createBulletExplosion(bullet.x, bullet.y);
        
        if (wall.type === OBJECT_TYPE.BRICK) {
            // 砖墙可以被摧毁
            const index = this.map.indexOf(wall);
            if (index !== -1) {
                this.map.splice(index, 1);
            }
        } else if (wall.type === OBJECT_TYPE.STEEL && bullet.isSuperBullet) {
            // 钢墙只能被超级子弹摧毁
            const index = this.map.indexOf(wall);
            if (index !== -1) {
                this.map.splice(index, 1);
                
                // 播放特殊爆炸效果
                this.createSteelExplosion(wall.x, wall.y);
            }
        }
        // 其他类型墙不受影响
    }
    
    // 创建子弹爆炸效果
    createBulletExplosion(x, y) {
        // 创建爆炸对象
        const explosion = {
            x: x - 8, // 居中显示
            y: y - 8,
            frame: 0,
            maxFrames: 3, // 爆炸动画有3帧
            size: 16, // 子弹爆炸效果较小
            update: (deltaTime) => {
                explosion.frame += 0.2; // 控制爆炸动画速度
                return explosion.frame >= explosion.maxFrames;
            },
            draw: (ctx, sprites) => {
                // 使用子弹爆炸的精灵图
                const spriteX = POS["bulletBomb"][0];
                const spriteY = POS["bulletBomb"][1];
                const frameWidth = 16;
                
                // 计算当前帧的位置
                const currentFrame = Math.min(Math.floor(explosion.frame), explosion.maxFrames - 1);
                
                ctx.drawImage(
                    sprites,
                    spriteX + currentFrame * frameWidth, spriteY,
                    frameWidth, frameWidth,
                    explosion.x, explosion.y,
                    explosion.size, explosion.size
                );
            }
        };
        
        // 将爆炸效果添加到游戏对象中
        if (!this.explosions) {
            this.explosions = [];
        }
        this.explosions.push(explosion);
    }
    
    // 创建钢墙爆炸特效
    createSteelExplosion(x, y) {
        // 创建爆炸对象
        const explosion = {
            x: x,
            y: y,
            frame: 0,
            maxFrames: 5, // 爆炸动画有5帧
            size: GRID_SIZE,
            update: (deltaTime) => {
                explosion.frame += 0.1; // 控制爆炸动画速度
                return explosion.frame >= explosion.maxFrames;
            },
            draw: (ctx, sprites) => {
                ctx.save();
                
                // 使用不同颜色的爆炸效果
                const alpha = 1 - explosion.frame / explosion.maxFrames;
                const size = explosion.size * (1 + explosion.frame * 0.2);
                
                // 蓝色爆炸效果
                ctx.globalAlpha = alpha;
                ctx.fillStyle = '#00ffff';
                ctx.beginPath();
                ctx.arc(
                    explosion.x + explosion.size / 2,
                    explosion.y + explosion.size / 2,
                    size / 2,
                    0, Math.PI * 2
                );
                ctx.fill();
                
                // 添加发光效果
                ctx.shadowColor = '#ffffff';
                ctx.shadowBlur = 20;
                ctx.beginPath();
                ctx.arc(
                    explosion.x + explosion.size / 2,
                    explosion.y + explosion.size / 2,
                    size / 3,
                    0, Math.PI * 2
                );
                ctx.fill();
                
                ctx.restore();
            }
        };
        
        // 将爆炸效果添加到游戏对象中
        if (!this.explosions) {
            this.explosions = [];
        }
        this.explosions.push(explosion);
    }
    
    // 检查胜利条件
    checkVictory() {
        // 只有当所有可能的敌人都已生成且场上没有敌人时才算胜利
        const totalEnemies = this.currentLevel > 0 ? levelData[this.currentLevel - 1].enemyCount : 0;
        
        if (this.enemiesGenerated >= totalEnemies && this.enemies.length === 0) {
            this.gameOver = true;
            this.showVictory();
            
            // 清理敌人生成器
            if (this.enemyGeneratorTimer) {
                clearInterval(this.enemyGeneratorTimer);
            }
        }
    }
    
    // 显示游戏结束界面
    showGameOver() {
        this.gameOverScreen.style.display = 'flex';
        // 清理计时器
        if (this.enemyGeneratorTimer) {
            clearInterval(this.enemyGeneratorTimer);
        }
    }
    
    // 显示胜利界面
    showVictory() {
        this.gameWinScreen.style.display = 'flex';
        // 清理计时器
        if (this.enemyGeneratorTimer) {
            clearInterval(this.enemyGeneratorTimer);
        }
    }
    
    // 重新开始游戏
    restartGame(resetScore = true) {
        if (resetScore) {
            this.score = 0;
        }
        this.playerLives = 3;
        // 关卡在resetScore为true时重置为1，否则保持currentLevel不变
        if (resetScore) {
            this.currentLevel = 1;
        }
        this.gameOverScreen.style.display = 'none';
        this.gameWinScreen.style.display = 'none';
        
        // 清理计时器
        if (this.enemyGeneratorTimer) {
            clearInterval(this.enemyGeneratorTimer);
        }
        
        this.startGame();
    }
    
    // 进入下一关
    startNextLevel() {
        this.currentLevel++;
        this.gameWinScreen.style.display = 'none';
        
        // 检查是否还有下一关
        if (this.currentLevel > levelData.length) {
            alert('恭喜你通关了所有关卡!');
            this.currentLevel = 1;
        }
        
        // 更新URL参数
        const url = new URL(window.location);
        url.searchParams.set('level', this.currentLevel);
        window.history.pushState({}, '', url);
        
        this.startGame();
    }
    
    // 添加跳转关卡的方法
    jumpToLevel(level) {
        if (level >= 1 && level <= levelData.length) {
            this.currentLevel = level;
            // 更新URL，但不刷新页面
            const url = new URL(window.location);
            url.searchParams.set('level', level);
            window.history.pushState({}, '', url);
            
            // 重新开始游戏
            this.restartGame(false); // 传入false表示不重置分数
        }
    }
    
    // 渲染游戏
    render() {
        // 清除画布
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 先绘制不会遮挡其他元素的地图元素
        this.map.forEach(object => {
            if (object.type !== OBJECT_TYPE.GRASS) {
                object.draw(this.ctx, this.sprites);
            }
        });
        
        // 绘制基地
        this.base.draw(this.ctx, this.sprites);
        
        // 绘制玩家坦克
        this.player.draw(this.ctx, this.sprites);
        
        // 绘制敌人坦克
        this.enemies.forEach(enemy => {
            enemy.draw(this.ctx, this.sprites);
        });
        
        // 绘制子弹
        this.bullets.forEach(bullet => {
            bullet.draw(this.ctx, this.sprites);
        });
        
        // 绘制爆炸效果
        if (this.explosions) {
            this.explosions.forEach(explosion => {
                explosion.draw(this.ctx, this.sprites);
            });
        }
        
        // 最后绘制草地（草地应该在坦克上方显示，产生遮挡效果）
        this.map.forEach(object => {
            if (object.type === OBJECT_TYPE.GRASS) {
                object.draw(this.ctx, this.sprites);
            }
        });
    }
    
    // 创建关卡选择器（嵌入到HUD右侧，避免与右上角按钮重叠）
    createLevelSelector() {
        const hudRight = document.querySelector('.hud > div:last-child');
        const hudLeft = document.querySelector('.hud-left');
        if (!hudRight) return;

        // 容器并排放置在右侧按钮后面
        const selectorContainer = document.createElement('div');
        selectorContainer.className = 'level-selector';
        selectorContainer.style.display = 'inline-flex';
        selectorContainer.style.alignItems = 'center';
        selectorContainer.style.gap = '6px';
        selectorContainer.style.marginLeft = '8px';

        const label = document.createElement('span');
        label.textContent = '选择关卡:';
        label.style.color = '#fff';

        const select = document.createElement('select');
        select.id = 'levelSelector';
        select.style.padding = '6px 8px';
        select.style.borderRadius = '6px';
        select.style.border = '1px solid #ffd700';
        select.style.background = 'rgba(0,0,0,0.5)';
        select.style.color = '#fff';

        for (let i = 0; i < levelData.length; i++) {
            const option = document.createElement('option');
            option.value = i + 1;
            option.textContent = `第${i + 1}关: ${levelData[i].name}`;
            select.appendChild(option);
        }
        select.value = this.currentLevel;

        // 选择后失焦，防止箭头键继续控制下拉框
        select.addEventListener('change', (e) => {
            this.jumpToLevel(parseInt(e.target.value));
            e.target.blur();
        });

        selectorContainer.appendChild(label);
        selectorContainer.appendChild(select);
        hudRight.appendChild(selectorContainer);

        // 在HUD左侧附加当前关卡名称，避免与选择器重叠
        let levelNameDisplay = document.getElementById('currentLevelName');
        if (!levelNameDisplay) {
            levelNameDisplay = document.createElement('div');
            levelNameDisplay.id = 'currentLevelName';
            levelNameDisplay.style.marginLeft = '14px';
            levelNameDisplay.style.color = '#00ff00';
            levelNameDisplay.style.fontWeight = '700';
            if (hudLeft) hudLeft.appendChild(levelNameDisplay);
        }
    }
    
    // 更新关卡名称显示
    updateLevelNameDisplay() {
        const levelNameElement = document.getElementById('currentLevelName');
        if (levelNameElement) {
            const currentLevelData = levelData[this.currentLevel - 1];
            levelNameElement.textContent = `当前关卡: ${currentLevelData.name}`;
        }
        
        const selector = document.getElementById('levelSelector');
        if (selector) {
            selector.value = this.currentLevel;
        }
    }
}

// 游戏物体基类
class GameObject {
    constructor(x, y, type, width = GRID_SIZE, height = GRID_SIZE) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = width;
        this.height = height;
    }
    
    // 检测碰撞
    collidesWith(obj) {
        return (
            this.x < obj.x + obj.width &&
            this.x + this.width > obj.x &&
            this.y < obj.y + obj.height &&
            this.y + this.height > obj.y
        );
    }
}

// 坦克类
class Tank extends GameObject {
    constructor(x, y, direction, type, isPlayer, tankType = 'basic', enemyData = null) {
        super(x, y, type, TANK_SIZE, TANK_SIZE);
        this.direction = direction;
        this.speed = isPlayer ? 3 : 2; // 玩家比敌人快一点
        this.isMoving = false;
        this.isPlayer = isPlayer;
        this.tankType = tankType;
        this.shootCooldown = 0;
        this.maxShootCooldown = isPlayer ? 300 : 1500; // 玩家射击频率更高
        
        // 敌人特殊属性
        if (!isPlayer && enemyData) {
            this.isStatic = enemyData.isStatic || false; // 固定炮台
            this.patrolPath = enemyData.patrolPath || null; // 巡逻路径
            this.patrolIndex = 0; // 当前巡逻点索引
            this.patrolTimer = 0; // 巡逻计时器
        }
        
        // 特殊技能属性（仅玩家使用）
        if (isPlayer) {
            // 超级炮弹技能 - 可摧毁钢墙
            this.superBulletCooldown = 0;
            this.maxSuperBulletCooldown = 10000; // 10秒冷却
            
            // 闪现冲刺技能 - 短距离瞬移
            this.dashCooldown = 0;
            this.maxDashCooldown = 8000; // 8秒冷却
            this.isDashing = false;
            this.dashDistance = GRID_SIZE * 5; // 瞬移5格距离
        }
        
        // 根据坦克类型调整属性
        if (tankType === 'fast') {
            this.speed *= 1.5;
        } else if (tankType === 'armor') {
            this.speed *= 0.8;
            this.maxShootCooldown *= 0.8;
        }
    }
    
    // 更新坦克状态
    update(deltaTime, walls, otherTanks, base) {
        // 更新冷却时间
        if (this.shootCooldown > 0) {
            this.shootCooldown -= deltaTime;
        }
        
        // 更新特殊技能冷却（仅玩家）
        if (this.isPlayer) {
            if (this.superBulletCooldown > 0) {
                this.superBulletCooldown -= deltaTime;
            }
            
            if (this.dashCooldown > 0) {
                this.dashCooldown -= deltaTime;
            }
        }
        
        if (!this.isMoving && !this.isDashing) return;
        
        const oldX = this.x;
        const oldY = this.y;
        
        // 根据方向移动
        if (this.isDashing) {
            // 瞬移逻辑
            switch (this.direction) {
                case UP: // 上
                    this.y -= this.dashDistance;
                    break;
                case RIGHT: // 右
                    this.x += this.dashDistance;
                    break;
                case DOWN: // 下
                    this.y += this.dashDistance;
                    break;
                case LEFT: // 左
                    this.x -= this.dashDistance;
                    break;
            }
            this.isDashing = false; // 瞬移结束
        } else {
            // 常规移动
            switch (this.direction) {
                case UP: // 上
                    this.y -= this.speed;
                    break;
                case RIGHT: // 右
                    this.x += this.speed;
                    break;
                case DOWN: // 下
                    this.y += this.speed;
                    break;
                case LEFT: // 左
                    this.x -= this.speed;
                    break;
            }
        }
        
        // 碰撞检测
        let collision = false;
        
        // 检查与墙壁碰撞
        for (const wall of walls) {
            if (this.collidesWith(wall)) {
                collision = true;
                break;
            }
        }
        
        // 检查与其他坦克碰撞
        for (const tank of otherTanks) {
            if (tank !== this && this.collidesWith(tank)) {
                collision = true;
                break;
            }
        }
        
        // 检查与基地碰撞
        if (base && this.collidesWith(base)) {
            collision = true;
        }
        
        // 检查是否超出边界
        if (
            this.x < 0 ||
            this.x + this.width > GAME_SIZE ||
            this.y < 0 ||
            this.y + this.height > GAME_SIZE
        ) {
            collision = true;
        }
        
        // 如果发生碰撞，恢复原位置
        if (collision) {
            this.x = oldX;
            this.y = oldY;
        }
    }
    
    // 移动坦克
    move(direction) {
        this.direction = direction;
        this.isMoving = true;
    }
    
    // 停止移动
    stopMoving() {
        this.isMoving = false;
    }
    
    // 普通射击
    shoot() {
        if (this.shootCooldown > 0) return null;
        
        this.shootCooldown = this.maxShootCooldown;
        
        // 创建子弹
        let bulletX = this.x + this.width / 2 - 3;
        let bulletY = this.y + this.height / 2 - 3;
        
        // 根据方向调整子弹位置
        switch (this.direction) {
            case UP:
                bulletY = this.y - 6;
                break;
            case RIGHT:
                bulletX = this.x + this.width;
                break;
            case DOWN:
                bulletY = this.y + this.height;
                break;
            case LEFT:
                bulletX = this.x - 6;
                break;
        }
        
        return new Bullet(bulletX, bulletY, this.direction, this.isPlayer);
    }
    
    // 超级炮弹 - 玩家特殊技能1
    shootSuperBullet() {
        if (!this.isPlayer || this.superBulletCooldown > 0) return null;
        
        this.superBulletCooldown = this.maxSuperBulletCooldown;
        
        // 创建超级子弹
        let bulletX = this.x + this.width / 2 - 3;
        let bulletY = this.y + this.height / 2 - 3;
        
        // 根据方向调整子弹位置
        switch (this.direction) {
            case UP:
                bulletY = this.y - 6;
                break;
            case RIGHT:
                bulletX = this.x + this.width;
                break;
            case DOWN:
                bulletY = this.y + this.height;
                break;
            case LEFT:
                bulletX = this.x - 6;
                break;
        }
        
        // 创建超级子弹，参数isPlayer, isSuperBullet
        return new Bullet(bulletX, bulletY, this.direction, true, true);
    }
    
    // 闪现冲刺 - 玩家特殊技能2
    dash() {
        if (!this.isPlayer || this.dashCooldown > 0) return false;
        
        this.dashCooldown = this.maxDashCooldown;
        this.isDashing = true;
        return true;
    }
    
    // 绘制坦克
    draw(ctx, sprites) {
        // 根据坦克类型和方向确定sprite位置
        let spriteX = 0;
        let spriteY = 0;
        
        if (this.isPlayer) {
            // 玩家坦克
            spriteX = POS["player"][0];
            spriteY = POS["player"][1];
            
            // 根据方向调整
            switch (this.direction) {
                case UP:
                    // 默认朝上，不需要调整
                    break;
                case DOWN:
                    spriteX += 32;
                    break;
                case LEFT:
                    spriteX += 64;
                    break;
                case RIGHT:
                    spriteX += 96;
                    break;
            }
        } else {
            // 敌人坦克
            let enemyType;
            switch (this.tankType) {
                case 'basic':
                    enemyType = "enemy1";
                    break;
                case 'fast':
                    enemyType = "enemy2";
                    break;
                case 'armor':
                    enemyType = "enemy3";
                    break;
            }
            
            spriteX = POS[enemyType][0];
            spriteY = POS[enemyType][1];
            
            // 根据方向调整
            switch (this.direction) {
                case UP:
                    // 默认朝上，不需要调整
                    break;
                case DOWN:
                    spriteX += 32;
                    break;
                case LEFT:
                    spriteX += 64;
                    break;
                case RIGHT:
                    spriteX += 96;
                    break;
            }
        }
        
        ctx.drawImage(
            sprites,
            spriteX, spriteY,
            32, 32,
            this.x, this.y,
            this.width, this.height
        );
    }
}

// 子弹类
class Bullet extends GameObject {
    constructor(x, y, direction, isPlayer, isSuperBullet = false) {
        super(x, y, OBJECT_TYPE.BULLET, 6, 6);
        this.direction = direction;
        this.speed = isPlayer ? 5 : 4; // 在较小的网格中略微降低子弹速度
        this.isPlayer = isPlayer;
        this.isSuperBullet = isSuperBullet;
        
        // 超级子弹更大，速度稍慢
        if (isSuperBullet) {
            this.width = 10;
            this.height = 10;
            this.speed *= 0.8;
        }
    }
    
    // 更新子弹状态
    update(deltaTime, walls, tanks, base) {
        // 根据方向移动
        switch (this.direction) {
            case UP:
                this.y -= this.speed;
                break;
            case RIGHT:
                this.x += this.speed;
                break;
            case DOWN:
                this.y += this.speed;
                break;
            case LEFT:
                this.x -= this.speed;
                break;
        }
        
        // 检查是否超出边界
        if (
            this.x < 0 ||
            this.x + this.width > GAME_SIZE ||
            this.y < 0 ||
            this.y + this.height > GAME_SIZE
        ) {
            return { destroyed: true };
        }
        
        // 检查与墙壁碰撞
        for (const wall of walls) {
            if (this.collidesWith(wall)) {
                return {
                    destroyed: true,
                    hitWall: wall
                };
            }
        }
        
        // 检查与坦克碰撞
        for (const tank of tanks) {
            if (this.collidesWith(tank)) {
                return {
                    destroyed: true,
                    hitTarget: tank
                };
            }
        }
        
        // 检查与基地碰撞
        if (base && this.collidesWith(base)) {
            return {
                destroyed: true,
                hitTarget: base
            };
        }
        
        return { destroyed: false };
    }
    
    // 绘制子弹
    draw(ctx, sprites) {
        const spriteX = POS["bullet"][0];
        const spriteY = POS["bullet"][1];
        
        // 根据方向选择子弹的图像
        let offsetX = 0;
        switch (this.direction) {
            case UP:
                // 默认方向，不需要调整
                break;
            case DOWN:
                offsetX = 6;
                break;
            case LEFT:
                offsetX = 12;
                break;
            case RIGHT:
                offsetX = 18;
                break;
        }
        
        // 如果是超级子弹，绘制不同颜色（略大的红色子弹）
        if (this.isSuperBullet) {
            ctx.save();
            ctx.fillStyle = '#ff3333';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // 添加发光效果
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = 10;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.restore();
        } else {
            // 普通子弹使用精灵图
            ctx.drawImage(
                sprites,
                spriteX + offsetX, spriteY,
                6, 6,
                this.x, this.y,
                this.width, this.height
            );
        }
    }
}

// 墙类
class Wall extends GameObject {
    constructor(x, y, type) {
        super(x, y, type);
    }
    
    // 绘制墙
    draw(ctx, sprites) {
        let spriteX = 0;
        let spriteY = 0;
        
        // 根据类型确定sprite位置
        if (this.type === OBJECT_TYPE.BRICK) {
            // 砖墙
            spriteX = 0;
            spriteY = 96;
        } else if (this.type === OBJECT_TYPE.STEEL) {
            // 钢墙
            spriteX = 32;
            spriteY = 96;
        } else if (this.type === OBJECT_TYPE.WATER) {
            // 水域有动画效果
            spriteX = 48;
            spriteY = 96;
            
            // 检查game对象中的animationCounter值
            if (game && game.animationCounter > 250) {
                spriteX += 16; // 切换到第二帧，使用横向位移
            }
        } else if (this.type === OBJECT_TYPE.GRASS) {
            // 草地
            spriteX = 64;
            spriteY = 96;
        }
        
        ctx.drawImage(
            sprites,
            spriteX, spriteY,
            16, 16,
            this.x, this.y,
            this.width, this.height
        );
    }
}

// 基地类
class Base extends GameObject {
    constructor(x, y, width = TANK_SIZE, height = TANK_SIZE) {
        super(x, y, OBJECT_TYPE.BASE, width, height);
        this.destroyed = false;
    }
    
    // 销毁基地
    destroy() {
        this.destroyed = true;
    }
    
    // 绘制基地
    draw(ctx, sprites) {
        // 使用POS["home"]获取基地的图像坐标
        const spriteX = POS["home"][0];
        const spriteY = POS["home"][1];
        
        // 正常基地或被摧毁的基地
        const offsetY = this.destroyed ? 32 : 0;
        
        ctx.drawImage(
            sprites,
            spriteX, spriteY + offsetY,
            32, 32,
            this.x, this.y,
            this.width, this.height
        );
    }
}

// 初始化游戏由 game.html 负责创建全局实例，避免重复初始化
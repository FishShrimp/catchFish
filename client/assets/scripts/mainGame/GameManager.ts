import Fish from "./Fish";
import {MyEvent, FishType} from "../Interface";
import Utils from "../Utils";
import Bullet from "./Bullet";
import MyGlobal from "../MyGlobal";
import CoinUp from "./CoinUp";
import Gold from "./Gold";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameManager extends cc.Component {

    // 鱼的预制体
    @property(cc.Prefab)
    fishPrefab: cc.Prefab = null;

    // 炮弹预制体
    @property(cc.Prefab)
    bulletPrefab: cc.Prefab = null;

    // 分值的预制体
    @property(cc.Prefab)
    coinUpPrefab: cc.Prefab = null;

    // 鱼网预制体
    @property(cc.Prefab)
    netPrefab: cc.Prefab = null;

    //炮弹图集
    @property(cc.SpriteAtlas)
    weaponAtlas: cc.SpriteAtlas = null;

    // 鱼游动的层
    @property(cc.Node)
    fishLayer: cc.Node = null;

    // 炮台节点
    @property(cc.Node)
    weapon: cc.Node = null;

    // 鱼的图集
    @property(cc.SpriteAtlas)
    fishAtlas: cc.SpriteAtlas = null;

    // 金币的预制体
    @property(cc.Prefab)
    goldPrefab: cc.Prefab = null;

    // 当前拥有多少金币
    @property(cc.Node)
    numControlNode: cc.Node = null;


    // 鱼的对象池
    public fishPool: cc.NodePool = new cc.NodePool();

    // 炮弹的对象池
    public bulletPool: cc.NodePool = new cc.NodePool();

    // 鱼网的对象池
    public netPool: cc.NodePool = new cc.NodePool();

    // 分数的对象池
    public coinUpPool: cc.NodePool = new cc.NodePool();

    // 金币对象池
    public goldPool: cc.NodePool = new cc.NodePool()


    protected onLoad(): void {
        // 初始化数据
        MyGlobal.init();

        const manager: cc.CollisionManager = cc.director.getCollisionManager();
        manager.enabled = true;
        // manager.enabledDebugDraw = true;

        // 把当前管理类放到全局的
        MyGlobal.GameManager = this;

        this.createFish();
        this.schedule(this.createFish, 2);

        // 监听触摸层传过来的时间，附带角度
        cc.director.on(MyEvent.TOUCHEND_SHOOT, this.fireBullet, this);
    }


    /**
     * 发射炮弹
     * @param angle 炮弹的角度
     */
    public fireBullet(angle): void {
        MyGlobal.NumControl.setGoldNum(MyGlobal.hasGold -= MyGlobal.weaponLevel);
        const bullet: cc.Node = Utils.getPoolNode(this.bulletPool, this.bulletPrefab);
        bullet.parent = this.fishLayer;
        bullet.getComponent(Bullet).init(angle);
    }

    // 创建鱼
    public createFish(): void {
        let fishCount: number = 5;
        let fishNode: cc.Node = null;
        for (let i = 0; i < fishCount; i++) {
            fishNode = Utils.getPoolNode(this.fishPool, this.fishPrefab);
            fishNode.parent = this.fishLayer;
            const x = -Math.random() * 150 - this.node.width / 2 - 100;
            const y = Math.random() * 500 - 250;
            const fishType = Utils.fishType[Math.floor(Math.random() * Utils.fishType.length)];
            fishNode.getComponent(Fish).init(x, y, fishType);
        }
    }

    // 创建获得的分数值
    public createCoinUp(pos: cc.Vec2, fishType: FishType): void {
        const coinUp: cc.Node = Utils.getPoolNode(this.coinUpPool, this.coinUpPrefab);
        coinUp.parent = this.fishLayer;
        coinUp.getComponent(CoinUp).init(pos, fishType);
    }

    // 创建金币
    public createGold(pos: cc.Vec2): void {
        const gold: cc.Node = Utils.getPoolNode(this.goldPool, this.goldPrefab);
        gold.parent = this.fishLayer;
        gold.getComponent(Gold).init(pos,cc.v2(-300,-270));
    }

    public testGameOver(): void {
        if (Utils.testGameOver()) {
            this.scheduleOnce(e => {
                // this.GameOverNode.active = true;
                cc.director.loadScene('gameOver');
            }, 0.5);
        }
    }

}

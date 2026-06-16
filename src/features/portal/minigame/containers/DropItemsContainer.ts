import { Scene } from "../Scene";
import { BumpkinContainer } from "../Core/BumpkinContainer";
import { DropItemType } from "../Types";
import { ORB_DEPTH } from "../constants";

interface Props {
  x: number;
  y: number;
  scene: Scene;
  player?: BumpkinContainer;
  itemKey: DropItemType;
}

export class DropItem extends Phaser.Physics.Arcade.Sprite {
  scene: Scene;
  private player?: BumpkinContainer;
  dropItem?: DropItemType;

  constructor({ scene, x, y, player, itemKey }: Props) {
    super(scene, x, y, itemKey);
    this.scene = scene;
    this.player = player;
    this.dropItem = itemKey;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(ORB_DEPTH);
    this.postFX.addGlow(0xffd966, 1.5, 0, false, 0.03, 24);

    this.handleCollision();
  }

  handleCollision() {
    if (!this.player) return;

    const scene = this.scene;
    this.scene.physics.add.collider(
      this,
      this.player,
      () => {
        this.destroy();
        scene.portalService?.send("COLLECT_ITEM", { itemKey: this.dropItem! });
      },
      undefined,
      this,
    );
  }
}

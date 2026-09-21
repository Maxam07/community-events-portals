export interface EnemyWeapon extends Phaser.GameObjects.Sprite {
  isDead: boolean;
  update(delta?: number): void;
  handlePlayerContact(): void;
}

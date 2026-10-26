import type { CompetitionPlayer } from "features/game/types/competitions";
import { excludePlayers } from "./PortalLeaderboard";

const player = (id: number, rank: number): CompetitionPlayer => ({
  id,
  rank,
  points: 100 - rank,
  username: `player-${id}`,
  bumpkin: {} as CompetitionPlayer["bumpkin"],
});

describe("excludePlayers", () => {
  it("returns the lists untouched when nobody is excluded", () => {
    const leaderboard = [player(1, 1), player(2, 2)];

    expect(excludePlayers([leaderboard, undefined], [])).toEqual([
      leaderboard,
      [],
    ]);
  });

  it("removes excluded players and renumbers the ranks below them", () => {
    const leaderboard = [player(1, 1), player(2, 2), player(3, 3)];

    const [result] = excludePlayers([leaderboard], [2]);

    expect(result.map(({ id, rank }) => ({ id, rank }))).toEqual([
      { id: 1, rank: 1 },
      { id: 3, rank: 2 },
    ]);
  });

  it("shifts miniboard ranks by excluded players found in the top list", () => {
    const leaderboard = [player(1, 1), player(2, 2), player(3, 3)];
    const miniboard = [player(40, 40), player(41, 41)];

    const [, result] = excludePlayers([leaderboard, miniboard], [1, 41]);

    expect(result.map(({ id, rank }) => ({ id, rank }))).toEqual([
      { id: 40, rank: 39 },
    ]);
  });
});

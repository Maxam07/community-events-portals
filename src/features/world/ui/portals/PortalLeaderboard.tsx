import React from "react";

import { useEffect } from "react";
import { useState } from "react";
import type {
  CompetitionLeaderboardResponse,
  CompetitionPlayer,
} from "features/game/types/competitions";
import type { MinigameName } from "features/game/types/minigames";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { getPortalLeaderboard } from "features/game/expansion/components/leaderboard/actions/leaderboard";
import { Loading } from "features/auth/components/Loading";
import { Label } from "components/ui/Label";
import classNames from "classnames";
import { toOrdinalSuffix } from "features/retreat/components/auctioneer/AuctionLeaderboardTable";
import { NPCIcon } from "features/island/bumpkin/components/NPC";
import { Button } from "components/ui/Button";

/**
 * Removes excluded players and shifts the remaining ranks up by the number of
 * excluded players ranked above them across all the given lists.
 */
export const excludePlayers = (
  lists: (CompetitionPlayer[] | undefined)[],
  excludedFarmIds: number[],
): CompetitionPlayer[][] => {
  if (excludedFarmIds.length === 0) return lists.map((list) => list ?? []);

  const excludedRanks = new Map<number, number>();
  lists.forEach((list) =>
    list?.forEach((player) => {
      if (excludedFarmIds.includes(player.id)) {
        excludedRanks.set(player.id, player.rank);
      }
    }),
  );
  const ranks = [...excludedRanks.values()];

  return lists.map((list) =>
    (list ?? [])
      .filter((player) => !excludedFarmIds.includes(player.id))
      .map((player) => ({
        ...player,
        rank: player.rank - ranks.filter((rank) => rank < player.rank).length,
      })),
  );
};

export const PortalLeaderboard: React.FC<{
  name: MinigameName;
  farmId: number;
  jwt: string;
  onBack?: () => void;
  startDate?: Date;
  endDate?: Date;
  formatPoints?: (value: number) => string;
  isAccumulator?: boolean;
  excludedFarmIds?: number[];
}> = ({
  name,
  farmId,
  jwt,
  onBack,
  startDate,
  endDate,
  formatPoints,
  isAccumulator,
  excludedFarmIds = [],
}) => {
  const [data, setData] = useState<CompetitionLeaderboardResponse>();
  const [now] = useState(() => Date.now());

  const formatDate = (date: Date) => date.toISOString().substring(0, 10);

  // Default 7 days ago
  const from = startDate
    ? formatDate(startDate)
    : formatDate(new Date(now - 7 * 24 * 60 * 60 * 1000));
  const to = endDate
    ? formatDate(new Date(Math.min(now, endDate.getTime())))
    : formatDate(new Date(now));

  const { t } = useAppTranslation();
  useEffect(() => {
    const load = async () => {
      const data = await getPortalLeaderboard({
        farmId,
        name,
        jwt,
        from,
        to,
      });

      setData(data);
    };

    load();
  }, []);

  if (!data) return <Loading />;

  const [leaderboard, miniboard] = excludePlayers(
    [data.leaderboard, data.miniboard],
    excludedFarmIds,
  );
  const [accumulators, accumulatorMiniboard] = excludePlayers(
    [data.accumulators, data.accumulatorMiniboard],
    excludedFarmIds,
  );
  const player =
    data.player && !excludedFarmIds.includes(data.player.id)
      ? data.player
      : undefined;
  const items =
    (!!isAccumulator && data.accumulators && accumulators.slice(0, 10)) ||
    leaderboard;
  const title =
    !!isAccumulator && accumulators?.length
      ? t("competition.accumulator")
      : t("competition.highscore");
  const miniboardItems =
    !!isAccumulator && accumulatorMiniboard?.length
      ? accumulatorMiniboard
      : miniboard;
  return (
    <>
      <div className="p-1">
        <div className="flex justify-between  items-center mb-2">
          <Label type="default" className="">
            {`${t("competition.leaderboard")} - ${title}`}
          </Label>
        </div>

        <p className="font-secondary text-xs my-2">{`${from} to ${endDate ? endDate.toISOString().substring(0, 10) : to}`}</p>

        <CompetitionTable items={items} formatPoints={formatPoints} />

        {/* Only show miniboard if player isn't in the main leaderboard */}
        {player && !items.find((m) => m.id === player.id) && (
          <>
            <p className="text-center text-xs mb-2">{`...`}</p>
            <CompetitionTable
              items={miniboardItems}
              formatPoints={formatPoints}
            />
          </>
        )}
      </div>

      {onBack && (
        <Button className="mt-1" onClick={onBack}>
          {t("back")}
        </Button>
      )}
    </>
  );
};

export const CompetitionTable: React.FC<{
  items: CompetitionPlayer[];
  formatPoints?: (value: number) => string;
}> = ({ items, formatPoints }) => {
  const { t } = useAppTranslation();
  if (items.length === 0) {
    return <p className="text-sm">{t("leaderboard.empty")}</p>;
  }

  return (
    <table className="w-full text-xs table-fixed border-collapse">
      <tbody>
        {items.map(({ username, points, rank, bumpkin }, index) => (
          <tr
            key={index}
            className={classNames("relative", {
              "bg-[#ead4aa]": index % 2 === 0,
            })}
          >
            <td
              style={{ border: "1px solid #b96f50" }}
              className="p-1.5 text-left w-12"
            >
              {toOrdinalSuffix(rank)}
            </td>
            <td
              style={{ border: "1px solid #b96f50" }}
              className="p-1.5 text-left pl-8 relative"
            >
              <div className="absolute" style={{ left: "4px", top: "1px" }}>
                <NPCIcon width={24} parts={bumpkin} />
              </div>
              {username}
            </td>
            <td
              style={{ border: "1px solid #b96f50" }}
              className="p-1.5 truncate text-center"
            >
              {formatPoints?.(points) ?? points}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

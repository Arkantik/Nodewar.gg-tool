import { useState } from "react";

export type NameIndexTarget = "player_one" | "player_two" | "guild";

export function useNameIndices(onChange?: (indices: { playerTwo: number; guild: number }) => void) {
	const [playerOneIndex, setPlayerOneIndex] = useState(0);
	const [playerTwoIndex, setPlayerTwoIndex] = useState(1);
	const [guildIndex, setGuildIndex] = useState(2);

	function updateNames(target: NameIndexTarget, value: number) {
		let newPlayerTwoIndex = playerTwoIndex;
		let newGuildIndex = guildIndex;

		if (target === "player_one") {
			if (value === playerTwoIndex) {
				setPlayerTwoIndex(playerOneIndex);
				newPlayerTwoIndex = playerOneIndex;
			} else if (value === guildIndex) {
				setGuildIndex(playerOneIndex);
				newGuildIndex = playerOneIndex;
			}
			setPlayerOneIndex(value);
		} else if (target === "player_two") {
			if (value === playerOneIndex) {
				setPlayerOneIndex(playerTwoIndex);
			} else if (value === guildIndex) {
				setGuildIndex(playerTwoIndex);
				newGuildIndex = playerTwoIndex;
			}
			setPlayerTwoIndex(value);
			newPlayerTwoIndex = value;
		} else {
			if (value === playerOneIndex) {
				setPlayerOneIndex(guildIndex);
			} else if (value === playerTwoIndex) {
				setPlayerTwoIndex(guildIndex);
				newPlayerTwoIndex = guildIndex;
			}
			setGuildIndex(value);
			newGuildIndex = value;
		}

		onChange?.({ playerTwo: newPlayerTwoIndex, guild: newGuildIndex });
	}

	return {
		playerOneIndex,
		playerTwoIndex,
		guildIndex,
		setPlayerOneIndex,
		setPlayerTwoIndex,
		setGuildIndex,
		updateNames,
	};
}

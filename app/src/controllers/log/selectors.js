import { createSelector } from 'reselect';
import { logItemIdSelector } from 'controllers/pages';
import { calculateGrowthDuration, normalizeHistoryItem } from './utils';

const logSelector = (state) => state.log || {};

const historyEntriesSelector = (state) => logSelector(state).historyEntries || [];

export const activeItemIdSelector = (state) => logSelector(state).activeItemId || '';

export const historyItemsSelector = createSelector(
  historyEntriesSelector,
  logItemIdSelector,
  (entriesFromState, logItemId) => {
    if (!entriesFromState.length) return [];
    const entries = [...entriesFromState].reverse();

    const currentLaunch = entries.pop();
    const currentLaunchItem = currentLaunch.resources.find((item) => item.id === logItemId);
    const historyItems = entries.map((historyItem) => {
      const filteredSameHistoryItems = historyItem.resources.filter(
        (item) => item.uniqueId === currentLaunchItem.uniqueId,
      );

      return {
        ...normalizeHistoryItem(historyItem, filteredSameHistoryItems),
      };
    });

    currentLaunchItem.launchNumber = currentLaunch.launchNumber;
    historyItems.push(currentLaunchItem);

    return calculateGrowthDuration(historyItems);
  },
);
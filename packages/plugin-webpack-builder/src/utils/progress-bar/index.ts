import { grey } from 'ansis';

import { BULLET, CIRCLE_OPEN, CROSS, TICK } from './const';
import { colorize, ellipsisLeft, renderBar } from './cli';
import LogUpdate from './log-update';
import { ProgressState } from './types';
import { formatRequest } from './utils';

const logUpdate = new LogUpdate();

let lastRender = Date.now();

export class ProgressBar {
  states: Record<string, ProgressState> = {};

  start() {
    logUpdate.start();
  }

  done() {
    if (Object.values(this.states).every((state) => state.done)) {
      logUpdate.done();
    }
  }

  update(updateState: ProgressState) {
    this.states[updateState.name] = updateState;

    if (Date.now() - lastRender > 50 || updateState.progress === 100) {
      this._renderStates();
    }
  }

  _renderStates() {
    lastRender = Date.now();
    const statesArray = Object.values(this.states);

    const renderedStates = statesArray.map((c) => this._renderState(c)).join('\n\n');

    logUpdate.render(`\n${renderedStates}\n`);
  }

  _renderState(state: ProgressState) {
    const color = colorize(state.color);

    let line1;
    let line2;

    if (state.progress >= 0 && state.progress < 100) {
      // Running
      line1 = [
        color(BULLET),
        color(state.name),
        renderBar(state.progress, state.color),
        state.message,
        `(${state.progress || 0}%)`,
        grey(state.details[0] || ''),
        grey(state.details[1] || ''),
      ].join(' ');

      line2 = state.request
        ? ` ${grey(ellipsisLeft(formatRequest(state.request), logUpdate.columns))}`
        : '';
    } else {
      let icon = ' ';

      if (state.hasErrors) {
        icon = CROSS;
      } else if (state.progress === 100) {
        icon = TICK;
      } else if (state.progress === -1) {
        icon = CIRCLE_OPEN;
      }

      line1 = color(`${icon} ${state.name}`);
      line2 = grey(`  ${state.message}`);
    }

    return `${line1}\n${line2}`;
  }
}

import { Emitter } from '@/core/utils/emitter';
import _ from 'lodash';
import { GridPos } from './GridPos';

const notPersistedProperties: { [str: string]: boolean } = {
  events: true,
  fullscreen: true,
  isEditing: true,
};

export class PanelModel {
  public id: number;
  public gridPos: GridPos;
  public type: string;
  public title: string;
  public alert?: any;
  public scopedVars?: any;
  public repeat?: string;
  public repeatIteration?: number;
  public repeatPanelId?: number;
  public repeatDirection?: string;
  public repeatedByRow?: boolean;
  public minSpan?: number;
  public collapsed?: boolean;
  public panels?: any;
  public soloMode?: boolean;

  // non persisted
  public fullscreen: boolean;
  public isEditing: boolean;
  public events: Emitter;

  constructor(model) {
    this.events = new Emitter();

    // copy properties from persisted model
    // tslint:disable-next-line:forin
    for (const property in model) {
      this[property] = model[property];
    }

    if (!this.gridPos) {
      this.gridPos = { x: 0, y: 0, h: 3, w: 6 };
    }
  }

  public getSaveModel() {
    const model: any = {};
    for (const property in this) {
      if (notPersistedProperties[property] || !this.hasOwnProperty(property)) {
        continue;
      }

      model[property] = _.cloneDeep(this[property]);
    }

    return model;
  }

  public setViewMode(fullscreen: boolean, isEditing: boolean) {
    this.fullscreen = fullscreen;
    this.isEditing = isEditing;
    this.events.emit('panel-size-changed');
  }

  public updateGridPos(newPos: GridPos) {
    console.log('-------------------');
    let sizeChanged = false;

    if (this.gridPos.w !== newPos.w || this.gridPos.h !== newPos.h) {
      sizeChanged = true;
    }

    this.gridPos.x = newPos.x;
    this.gridPos.y = newPos.y;
    this.gridPos.w = newPos.w;
    this.gridPos.h = newPos.h;

    if (sizeChanged) {
      console.log('PanelModel sizeChanged event and render events fired');
      this.events.emit('panel-size-changed');
    }
  }

  public resizeDone() {
    this.events.emit('panel-size-changed');
  }

  public destroy() {
    this.events.removeAllListeners();
  }
}

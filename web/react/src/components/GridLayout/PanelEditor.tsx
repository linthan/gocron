import React, { PureComponent } from 'react';
export class PanelEditor extends PureComponent<any, any> {
  render() {
    return (
      <div className="panel-editor-container__editor">
        <div className="panel-editor-tabs" />
        <div className="panel-editor__right" />
      </div>
    );
  }
}

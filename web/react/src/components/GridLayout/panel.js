import React, { PureComponent } from 'react';
import { PanelHeader } from './panelHeader';
import * as streamedia from '../../vendor/player/player';
export class DashboardPanel extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      pluginExports: null,
    };
  }
  componentDidMount() {
    let player = new streamedia.WSPlayer(this.video, {
      // url: `${STREAM_URL}`,      // overrides mediaElement's sources
      modules: [
        {
          // client module constructor. Should be subclass or BaseClient. RTSPClient by default
          // client: RTSPClient,
          transport: {
            // client module constructor. Should be subclass or BaseTransport. WebsocketTransport by default
            // constructor: WebsocketTransport,
            options: {
              // address of websocket proxy described below. ws${location.protocol=='https:'?'s':''}://${location.host}/ws/ by default
              socket: 'ws://websocket_proxy_address/ws',
              // function called player exceptions
              errorHandler(e) {
                alert(`Failed to start player: ${e.message}`);
              },
              // function to get credentials for protected streams
              queryCredentials() {
                return new Promise((resolve, reject) => {
                  let c = prompt('input credentials in format user:password');
                  if (c) {
                    this.setCredentials.apply(this, c.split(':'));
                    resolve();
                  } else {
                    reject();
                  }
                });
              },
            },
          },
        },
      ],
    });
  }

  render() {
    const { panel, dashboard } = this.props;
    return (
      <div ref={element => (this.element = element)} className="panel-height-helper">
        <PanelHeader panel={panel} dashboard={dashboard} />
        <div className="panel-content">
          <video
            ref={element => (this.video = element)}
            width="100%"
            height="95%"
            id="test_video"
            controls
            autoplay
            src="rtsp://10.119.21.131:554/962618.sdp"
          />
        </div>
      </div>
    );
  }
}

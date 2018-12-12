import { getTagged } from './deps/bp_logger.js';
import { Url } from './core/util/url.js';
import { Remuxer } from './core/remuxer/remuxer.js';
import DEFAULT_CLIENT from './client/rtsp/client.js';
import DEFAULT_TRANSPORT from './transport/websocket.js';

const Log = getTagged('wsp');

export class StreamType {
  static get HLS() {
    return 'hls';
  }
  static get RTSP() {
    return 'rtsp';
  }

  static isSupported(type) {
    return [StreamType.HLS, StreamType.RTSP].includes(type);
  }

  static fromUrl(url) {
    let parsed;
    try {
      parsed = Url.parse(url);
    } catch (e) {
      return null;
    }
    switch (parsed.protocol) {
      case 'rtsp':
        return StreamType.RTSP;
      case 'http':
      case 'https':
        if (url.indexOf('.m3u8') >= 0) {
          return StreamType.HLS;
        } else {
          return null;
        }
      default:
        return null;
    }
  }

  static fromMime(mime) {
    switch (mime) {
      case 'application/x-rtsp':
        return StreamType.RTSP;
      case 'application/vnd.apple.mpegurl':
      case 'application/x-mpegurl':
        return StreamType.HLS;
      default:
        return null;
    }
  }
}

export class WSPlayer {
  constructor(node, opts) {
    if (typeof node == typeof '') {
      this.player = document.getElementById(node);
    } else {
      this.player = node;
    }

    let modules = opts.modules || {
      client: DEFAULT_CLIENT,
      transport: {
        constructor: DEFAULT_TRANSPORT,
      },
    };
    this.errorHandler = opts.errorHandler || null;
    this.queryCredentials = opts.queryCredentials || null;

    this.modules = {};
    for (let module of modules) {
      let transport = module.transport || DEFAULT_TRANSPORT;
      let client = module.client || DEFAULT_CLIENT;
      if (transport.constructor.canTransfer(client.streamType())) {
        this.modules[client.streamType()] = {
          client: client,
          transport: transport,
        };
      } else {
        Log.warn(
          `Client stream type ${client.streamType()} is incompatible with transport types [${transport
            .streamTypes()
            .join(', ')}]. Skip`
        );
      }
    }

    this.type = StreamType.RTSP;
    this.url = null;
    if (opts.url && opts.type) {
      this.url = opts.url;
      this.type = opts.type;
    } else {
      if (!this._checkSource(this.player)) {
        for (let i = 0; i < this.player.children.length; ++i) {
          if (this._checkSource(this.player.children[i])) {
            break;
          }
        }
      }
      // if (!this.url) {
      //      throw new Error('No playable endpoint found');
      // }
    }

    if (this.url) {
      this.setSource(this.url, this.type);
    }

    this.player.addEventListener(
      'play',
      () => {
        if (!this.isPlaying()) {
          this.client.start();
        }
      },
      false
    );

    this.player.addEventListener(
      'pause',
      () => {
        this.client.stop();
      },
      false
    );

    this.player.addEventListener(
      'abort',
      () => {
        // disconnect the transport when the player is closed
        this.client.stop();
        this.transport.disconnect().then(() => {
          this.client.destroy();
        });
      },
      false
    );
  }

  // TODO: check native support

  isPlaying() {
    return !(this.player.paused || this.client.paused);
  }

  static canPlayWithModules(mimeType, modules) {
    let filteredModules = {};
    for (let module of modules) {
      let transport = module.transport || DEFAULT_TRANSPORT;
      let client = module.client || DEFAULT_CLIENT;
      if (transport.canTransfer(client.streamType())) {
        filteredModules[client.streamType()] = true;
      }
    }

    for (let type in filteredModules) {
      if (type == StreamType.fromMime(mimeType)) {
        return true;
      }
    }
    return false;
  }

  /// TODO: deprecate it?
  static canPlay(resource) {
    return StreamType.fromMime(resource.type) || StreamType.fromUrl(resource.src);
  }

  canPlayUrl(src) {
    let type = StreamType.fromUrl(src);
    return type in this.modules;
  }

  _checkSource(src) {
    if (
      !src.dataset['ignore'] &&
      src.src &&
      !this.player.canPlayType(src.type) &&
      (StreamType.fromMime(src.type) || StreamType.fromUrl(src.src))
    ) {
      this.url = src.src;
      this.type = src.type ? StreamType.fromMime(src.type) : StreamType.fromUrl(src.src);
      return true;
    }
    return false;
  }

  async setSource(url, type) {
    if (this.transport) {
      if (this.client) {
        await this.client.detachTransport();
      }
      await this.transport.destroy();
    }
    try {
      this.endpoint = Url.parse(url);
    } catch (e) {
      return;
    }
    this.url = url;
    let transport = this.modules[type].transport;
    this.transport = new transport.constructor(this.endpoint, this.type, transport.options);

    let lastType = this.type;
    this.type = (StreamType.isSupported(type) ? type : false) || StreamType.fromMime(type);
    if (!this.type) {
      throw new Error('Bad stream type');
    }

    if (lastType != this.type || !this.client) {
      if (this.client) {
        await this.client.destroy();
      }
      let client = this.modules[type].client;
      this.client = new client();
    } else {
      this.client.reset();
    }

    if (this.queryCredentials) {
      this.client.queryCredentials = this.queryCredentials;
    }
    if (this.remuxer) {
      this.remuxer.destroy();
      this.remuxer = null;
    }
    this.remuxer = new Remuxer(this.player);
    this.remuxer.attachClient(this.client);

    this.client.attachTransport(this.transport);
    this.client.setSource(this.endpoint);

    if (this.player.autoplay) {
      this.start();
    }
  }

  start() {
    if (this.client) {
      this.client.start().catch(e => {
        if (this.errorHandler) {
          this.errorHandler(e);
        }
      });
    }
  }

  stop() {
    if (this.client) {
      this.client.stop();
    }
  }

  async destroy() {
    if (this.transport) {
      if (this.client) {
        await this.client.detachTransport();
      }
      await this.transport.destroy();
    }
    if (this.client) {
      await this.client.destroy();
    }
    if (this.remuxer) {
      this.remuxer.destroy();
      this.remuxer = null;
    }
  }
}

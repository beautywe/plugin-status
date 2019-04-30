import Status from './status';
import pkgInfo from '../package.json';

module.exports = function status(options = {}) {
    return {
        name: 'status',
        npmName: pkgInfo.name,
        version: pkgInfo.version,
        relyOn: [{
            name: 'event',
            npmName: '@beautywe/plugin-event',
        }],

        nativeHook: {
            onLaunch() {
                this.status.initStatus();
            },
            onLoad() {
                this.status.initStatus();
            },
        },

        customMethod: {
            get(name) {
                return this.status._statuses[name];
            },
            remove(name) {
                delete this.status._statuses[name];
            },
            add(name) {
                if (!this.status._statuses) this.status._statuses = {};
                if (!this.status._statuses[name]) this.status._statuses[name] = new Status(name, { theHost: this });
                return this.status._statuses[name];
            },
            initStatus() {
                if (options.statuses && Array.isArray(options.statuses)) {
                    options.statuses.forEach(statusName => this.status.add(statusName));
                }
            },
        },
    };
};
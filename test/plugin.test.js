import { BtApp } from '@beautywe/core';
import event from '@beautywe/plugin-event';
import test from 'ava';
import status from '../src/status.plugin';
import Status from '../src/status';

const statuses = [
    'abc',
    'efg',
    'home:applaunch',
];

function newAppUseingPlugin() {
    const app = new BtApp();
    const plugin = status({ statuses });
    const eventPlugin = event();
    app.use(eventPlugin);
    app.use(plugin);

    return Promise
        .resolve()
        .then(() => app.onLaunch())
        .then(() => ({ app, plugin }));
}

test('use plugin', (t) => {
    return Promise
        .resolve()
        .then(() => newAppUseingPlugin())
        .then(({ app, plugin }) => {
            t.is(app._btPlugin.plugins[1].name, plugin.name);
            t.truthy(app[`${plugin.name}`]);
        });

});

test('get, add, remove', (t) => {
    return Promise
        .resolve()
        .then(() => newAppUseingPlugin())
        .then(({ app }) => {
            statuses.forEach((name) => {
                t.truthy(app.status.get(name) instanceof Status);
            });

            const testName = Symbol('testName');
            app.status.add(testName);
            t.truthy(app.status.get(testName) instanceof Status);

            app.status.remove(testName);
            t.is(app.status.get(testName), undefined);
        });
});

test('change stats: success, fail, ing, reset', (t) => {
    return Promise
        .resolve()
        .then(() => newAppUseingPlugin())
        .then(({ app }) => {
            const testName = 'testName';
            app.status.add(testName);
            t.false(app.status.get(testName).isIng());
            t.false(app.status.get(testName).isSuccess());
            t.false(app.status.get(testName).isFail());

            app.status.get(testName).success();
            t.false(app.status.get(testName).isIng());
            t.true(app.status.get(testName).isSuccess());
            t.false(app.status.get(testName).isFail());

            app.status.get(testName).fail();
            t.false(app.status.get(testName).isIng());
            t.false(app.status.get(testName).isSuccess());
            t.true(app.status.get(testName).isFail());

            app.status.get(testName).ing();
            t.true(app.status.get(testName).isIng());
            t.false(app.status.get(testName).isSuccess());
            t.false(app.status.get(testName).isFail());

            app.status.get(testName).reset();
            t.false(app.status.get(testName).isIng());
            t.false(app.status.get(testName).isSuccess());
            t.false(app.status.get(testName).isFail());
        });
});

test('onceSuccess', (t) => {
    return Promise
        .resolve()
        .then(() => newAppUseingPlugin())
        .then(({ app }) => {
            const testName = 'testName';
            const testStatus = app.status.add(testName);
            const message = Symbol('abc');

            return new Promise((resolve) => {
                testStatus.onceSuccess().then((msg) => {
                    t.is(msg, message);
                    resolve();
                });

                testStatus.success(message);
            });
        });
});

test('onceFail', (t) => {
    return Promise
        .resolve()
        .then(() => newAppUseingPlugin())
        .then(({ app }) => {

            const testName = 'testName';
            const testStatus = app.status.add(testName);
            const message = Symbol('abc');

            return new Promise((resolve) => {
                testStatus.onceFail().then((msg) => {
                    t.is(msg, message);
                    resolve();
                });
                testStatus.fail(message);
            });
        });
});

test('must', (t) => {
    return Promise
        .resolve()
        .then(() => newAppUseingPlugin())
        .then(({ app }) => {
            const testName = 'testName';
            const testStatus = app.status.add(testName);

            return new Promise((resolve) => {
                testStatus.must().then(() => {
                    t.is(true, true);
                    resolve();
                });

                // must 内部是在 promise 里面注册事件，所以这里要在 nextTick 中触发。
                Promise
                    .resolve()
                    .then(() => {
                        testStatus.fail('cba');
                        testStatus.success();
                    });
            });
        });
});

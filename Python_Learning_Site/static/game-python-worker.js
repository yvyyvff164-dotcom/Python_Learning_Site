/* Each check runs in its own worker so the animated page stays responsive. */
importScripts('vendor/skulpt/skulpt.min.js', 'vendor/skulpt/skulpt-stdlib.js');

async function program(source, values, write) {
    let cursor = 0;
    Sk.configure({
        __future__: Sk.python3, execLimit: 1500, yieldLimit: 40,
        output: write,
        read(path) {
            if (!Object.hasOwn(Sk.builtinFiles.files, path)) throw new Sk.builtin.IOError(path);
            return Sk.builtinFiles.files[path];
        },
        inputfun() {
            if (cursor >= values.length) throw new Sk.builtin.EOFError('input()');
            return String(values[cursor++]);
        }
    });
    return Sk.misceval.asyncToPromise(() => Sk.importMainWithBody('<stdin>', false, source, true));
}

async function movement(message) {
    const module = await program(message.source, [], () => {});
    const step = module.$d.step;
    if (!step || !Sk.builtin.checkCallable(step)) throw new Error('STEP');
    async function call(position, limit) {
        const args = [position,limit].map(value => new Sk.builtin.int_(value));
        const result = await Sk.misceval.asyncToPromise(() => Sk.misceval.callsimOrSuspendArray(step, args));
        const value = Sk.ffi.remapToJs(result);
        if (!Number.isSafeInteger(value)) throw new Error('INTEGER');
        return value;
    }
    const positions = [message.start];
    for (let i = 0; i < 7; i++) positions.push(await call(positions[i], message.limit));
    const values = [];
    for (const [p,limit] of message.trials) values.push(await call(p,limit));
    return {positions, values};
}

async function examples(message) {
    const results = [];
    for (const input of message.inputs) {
        let out = '';
        try {
            await program(message.source,input,part => {
                if (out.length + part.length > 1800) throw new Error('OUTPUT');
                out += part;
            });
            results.push({output:out.trim()});
        } catch (error) {
            results.push({error:String(error).slice(0,270)});
        }
    }
    return {results};
}

self.onmessage = async ({data}) => {
    try { self.postMessage(data.mode === 'bugs' ? await movement(data) : await examples(data)); }
    catch (error) { self.postMessage({error:String(error).slice(0,270)}); }
};

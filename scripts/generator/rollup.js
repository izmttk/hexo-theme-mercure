const rollup = require('rollup');
const path = require('path');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const styles = require('rollup-plugin-styles');
const css = require('rollup-plugin-css-only');
const svelte = require('rollup-plugin-svelte');

const inputOptions = {
    input: path.join(hexo.theme_dir, 'lib/index.js'),
    plugins: [
        svelte({
            
        }),
        styles({
            mode: 'emit',
            config: true
        }),
        css(),
        nodeResolve(),
        commonjs(),
    ],
};
const outputOptions = {
    format: 'umd',
    // assetFileNames: "[name]-[hash][extname]",
    name: 'mercure',
};

function build() {
    // create a bundle
    return rollup.rollup(inputOptions).then(bundle => {
        // generate code and a sourcemap
        return bundle.generate(outputOptions);
    }).then(result => {
        return result.output;
    });
}

process.chdir(hexo.theme_dir)

hexo.extend.generator.register("rollup", function(locals) {
    return build().then(output => {
        // console.log(output);
        let route = [];
        for (const chunkOrAsset of output) {
            if (chunkOrAsset.type === 'asset') {
                const asset = chunkOrAsset;
                route.push({
                    path: `bundle/${asset.fileName}`,
                    data: asset.source
                });
            } else {
                const chunk = chunkOrAsset;
                route.push({
                    path: `bundle/${chunk.name}.bundle.js`,
                    data: chunk.code
                });
                if(chunk.map) {
                    route.push({
                        path: `bundle/${chunk.name}.bundle.js.map`,
                        data: chunk.map
                    });
                }
            }
        }
        return route;
    });
});
const fs = require('fs');
const fg = require('fast-glob');

const css = require('css');

const globs = ['**/branding.css'];
const sourceRuleSelector = '.mwc .mwc-t1';
const sourceRuleProperty = 'color';
const cloneRuleSelectors = ['.mwc .mwc-account-bonus-balance-value'];

fg(globs)
    .then(entries => {
        const entries$ = entries
            .map(entry => {
                return readFile(entry)
                    .then(cssRaw => cloneProperty(cssRaw, sourceRuleSelector, sourceRuleProperty, cloneRuleSelectors))
                    .then(cssRaw => writeFile(entry, cssRaw))
                    .then(() => console.log('File processed', entry))
                    .catch((error) => console.log('File processing error', entry, '-', error.message));
            });
        return Promise.all(entries$);
    })
    .then(() => console.log('All entries processed.'));

function readFile(entry) {
    return new Promise((resolve, reject) => {
        fs.readFile(entry, 'utf-8', (error, data) => {
            if (error) {
                return reject(error);
            }

            resolve(data);
        });
    });
}

function writeFile(entry, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(entry, data, 'utf-8', (error, data) => {
            if (error) {
                return reject(error);
            }

            resolve(data);
        });
    });
}

function cloneProperty(rawCss, sourceSelector, property, selectors) {
    const ast = css.parse(rawCss);

    const searchedRule = ast
        .stylesheet
        .rules
        .find((rule) => {
            return rule.type === 'rule' && rule.selectors.indexOf(sourceSelector) > -1;
        });

    if (!searchedRule) {
        throw new Error('No searched rule');
    }

    const declaration = searchedRule
        .declarations
        .find((declaration) => declaration.property === property);

    if (!declaration) {
        throw new Error('No searched property');
    }

    const rule = {
            type: 'rule',
            selectors,
            declarations: [Object.assign(declaration)]
    };

    ast
        .stylesheet
        .rules
        .push(rule);

    return css.stringify(ast);
}
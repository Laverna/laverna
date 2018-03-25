import Radio from 'backbone.radio';

const theme = {
    /**
     * Apply a theme.
     *
     * @param {Object} data
     * @param {String} data.name - theme name
     */
    applyTheme(data = {}) {
        const theme = data.name || Radio.request('collections/Configs', 'findConfig', {
            name: 'theme',
        });

        $('#lav--theme').attr('href', `styles/theme-${theme || 'default'}.css`);
    },

    /**
     * Initializer.
     */
    initializer() {
        Radio.on('components/settings', 'changeTheme', theme.applyTheme);
        theme.applyTheme();
    },
};

Radio.once('App', 'init', () => {
    Radio.request('utils/Initializer', 'add', {
        name    : 'App:utils',
        callback: theme.initializer,
    });
});

export default theme;

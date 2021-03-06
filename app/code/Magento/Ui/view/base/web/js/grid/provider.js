/**
 * Copyright © 2016 Magento. All rights reserved.
 * See COPYING.txt for license details.
 */

define([
    'jquery',
    'underscore',
    'mageUtils',
    'rjsResolver',
    'uiLayout',
    'Magento_Ui/js/modal/alert',
    'mage/translate',
    'uiElement'
], function ($, _, utils, resolver, layout, alert, $t, Element) {
    'use strict';

    return Element.extend({
        defaults: {
            firstLoad: true,
            storageConfig: {
                component: 'Magento_Ui/js/grid/data-storage',
                provider: '${ $.storageConfig.name }',
                name: '${ $.name }_storage',
                updateUrl: '${ $.update_url }'
            },
            listens: {
                params: 'onParamsChange'
            }
        },

        /**
         * Initializes provider component.
         *
         * @returns {Provider} Chainable.
         */
        initialize: function () {
            utils.limit(this, 'onParamsChange', 5);
            _.bindAll(this, 'onReload');

            this._super()
                .initStorage()
                .clearData();

            return this;
        },

        /**
         * Initializes storage component.
         *
         * @returns {Provider} Chainable.
         */
        initStorage: function () {
            layout([this.storageConfig]);

            return this;
        },

        /**
         * Clears provider's data properties.
         *
         * @returns {Provider} Chainable.
         */
        clearData: function () {
            this.setData({
                items: [],
                totalRecords: 0
            });

            return this;
        },

        /**
         * Overrides current data with a provided one.
         *
         * @param {Object} data - New data object.
         * @returns {Provider} Chainable.
         */
        setData: function (data) {
            data = this.processData(data);

            this.set('data', data);

            return this;
        },

        /**
         * Processes data before applying it.
         *
         * @param {Object} data - Data to be processed.
         * @returns {Object}
         */
        processData: function (data) {
            var items = data.items;

            _.each(items, function (record, index) {
                record._rowIndex = index;
            });

            return data;
        },

        /**
         * Reloads data with current parameters.
         *
         * @returns {Promise} Reload promise object.
         */
        reload: function (options) {
            var request = this.storage().getData(this.params, options);

            this.trigger('reload');

            request
                .done(this.onReload)
                .fail(this.onError);

            return request;
        },

        /**
         * Handles changes of 'params' object.
         */
        onParamsChange: function () {
            this.firstLoad ?
                resolver(this.reload, this) :
                this.reload();
        },

        /**
         * Handles reload error.
         */
        onError: function (xhr) {
            if (xhr.statusText === 'abort') {
                return;
            }

            alert({
                content: $t('Something went wrong.')
            });
        },

        /**
         * Handles successful data reload.
         *
         * @param {Object} data - Retrieved data object.
         */
        onReload: function (data) {
            this.firstLoad = false;

            this.setData(data)
                .trigger('reloaded');
        }
    });
});

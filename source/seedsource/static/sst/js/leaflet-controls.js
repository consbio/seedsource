L.Control.Opacity = L.Control.extend({
    options: {
        position: 'topright'
    },
    
    onAdd: function(map) {
        var container = L.DomUtil.create('div', 'leaflet-opacity-control leaflet-bar');
        L.DomUtil.create('span', 'glyphicon glyphicon-adjust', container);

        var slider = L.DomUtil.create('input', '', container);
        slider.type = 'range';
        slider.setAttribute('orient', 'vertical');
        slider.min = 20;
        slider.max = 100;
        slider.step = 1;
        slider.value = 100;

        L.DomEvent.on(slider, 'mousedown mouseup click', L.DomEvent.stopPropagation);

        /* IE11 seems to process events in the wrong order, so the only way to prevent map movement while dragging the
         * slider is to disable map dragging when the cursor enters the slider (by the time the mousedown event fires
         * it's too late becuase the event seems to go to the map first, which results in any subsequent motion
         * resulting in map movement even after map.dragging.disable() is called.
         */
        L.DomEvent.on(slider, 'mouseenter', function(e) {
            map.dragging.disable()
        });
        L.DomEvent.on(slider, 'mouseleave', function(e) {
            map.dragging.enable();
        });

        L.DomEvent.on(slider, 'input change', function(e) {
            this.fire('change', {value: e.target.value});
        }.bind(this));

        this._slider = slider;
        this._container = container;

        return this._container;
    },

    includes: L.Mixin.Events
});

L.control.opacity = function (options) {
  return new L.Control.Opacity(options);
};

L.Control.Button = L.Control.extend({
    options: {
        position: 'topright',
        icon: ''
    },

    onAdd: function(map) {
        var container = L.DomUtil.create('div', 'leaflet-button leaflet-bar');
        var button = L.DomUtil.create('span', 'glyphicon glyphicon-' + this.options.icon, container);

        L.DomEvent
            .on(button, 'click', function(e) {
                this.fire('click', {target: this});
            }.bind(this))
            .on(button, 'mousedown mouseup click', L.DomEvent.stopPropagation);

        this._button = button;
        this._container = container;
        return this._container;
    },

    setIcon: function(icon) {
        this.options.icon = icon;
        this._button.setAttribute('class', 'glyphicon glyphicon-' + icon);
    },

    includes: L.Mixin.Events
});

L.control.button = function(options) {
    return new L.Control.Button(options);
}

L.Control.Legend = L.Control.extend({
    options: {
        position: 'bottomright',
        legends: []
    },

    onAdd: function(map) {
        this._container = L.DomUtil.create('div', 'leaflet-bar leaflet-legend');

        L.DomEvent.on(this._container, 'click', function(e) {
            e.stopPropagation();
        });

        this._rebuildLegends();

        return this._container;
    },

    _rebuildLegends: function() {
        L.DomUtil.empty(this._container);

        this.options.legends.forEach(function(legend) {
            var container = L.DomUtil.create('div', 'legend-item', this._container);
            var label = L.DomUtil.create('h4', null, container);
            label.innerHTML = legend.label;

            var table = L.DomUtil.create('table', null, container);
            var tbody  = L.DomUtil.create('tbody', null, table);

            legend.elements.forEach(function(item) {
                var tr = L.DomUtil.create('tr', null, tbody);
                var imageCell = L.DomUtil.create('td', null, tr);

                var image = L.DomUtil.create('img', null, imageCell);
                image.src = 'data:image/png;base64,' + item.imageData;

                var labelCell = L.DomUtil.create('td', null, tr);
                labelCell.innerHTML = item.label;
            }.bind(this));
        }.bind(this));
    },

    setLegends: function(legends) {
        this.options.legends = legends;

        this._rebuildLegends();
    }
});

L.control.legend = function(options) {
    return new L.Control.Legend(options);
}

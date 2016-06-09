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
        L.DomEvent.on(slider, 'input', function(e) {
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

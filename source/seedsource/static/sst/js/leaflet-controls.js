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

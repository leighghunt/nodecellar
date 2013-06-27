window.WineView = Backbone.View.extend({

    initialize: function () {
        this.render();
    },

    render: function () {
        $(this.el).html(this.template(this.model.toJSON()));


/*
    L.tileLayer('http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/100725/256/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>[.]',
      maxZoom: 18
    }).addTo(map);
*/

var origin_CommunityBasemap = [-4020900, 19998100];
var origin_WCCAerials = [-5099531.19635, 57089446.18];

var resolutions_WCCAerials = [
            66.1459656252646,
            33.0729828126323,
            16.933367200067735,
            8.466683600033868,
            4.233341800016934,
            2.116670900008467,
            1.0583354500042335,
            0.5291677250021167,
            0.26458386250105836,
            0.13229193125052918,
            0.06614596562526459
        ];

var resolutions_CommunityBasemap = [
              4233.341800016934, 
              2116.670900008467, 
              1587.5031750063501, 
              1058.3354500042335,
               793.7515875031751,
               529.1677250021168,
               264.5838625010584, 
               132.2919312505292,
                66.1459656252646,
                33.0729828126323, 
                19.843789687579378, 
                13.229193125052918,
                 5.291677250021167,
                 2.6458386250105836,
                 1.3229193125052918,
                 0.6614596562526459
            ];

var minZoom_CommunityBasemap = 0;
var minZoom_WCCAerials = 0;
var maxZoom_CommunityBasemap = 15;
var maxZoom_WCCAerials = 10;

    var crs = new L.Proj.CRS('EPSG:2193',
        '+proj=tmerc +lat_0=0 +lon_0=173 +k=0.9996 +x_0=1600000 +y_0=10000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
        {
            origin: origin_WCCAerials,
            resolutions: resolutions_WCCAerials
        });

//    var map = L.map(this.$('#map')[0]).setView ([-41.289926, 174.775172], 16);

    var map = new L.Map(this.$('#map')[0], {
        crs: crs,
        scale: function(zoom) {
            return 1 / res[zoom];
        },
        continuousWorld: true,
        worldCopyJump: false
    });

    var tileUrl_CommunityBasemap = 'http://services.arcgisonline.co.nz/arcgis/rest/services/Generic/newzealand/MapServer/tile/{z}/{y}/{x}';
    var tileUrl_WCCAerials = 'http://gis.wcc.govt.nz/arcgis/rest/services/Basemap/Aerial_Photo/MapServer/tile/{z}/{y}/{x}';
    var attrib_CommunityBasemap = 'Eagle Technology Group Ltd And LINZ &copy; 2012';
    var attrib_WCCAerials = 'Wellington City Council &copy; 2012';

    var tilelayer = new L.TileLayer(tileUrl_WCCAerials, {
            maxZoom: maxZoom_WCCAerials,
            minZoom: minZoom_WCCAerials,
            continuousWorld: true,
            attribution: attrib_WCCAerials,
	    tileSize: 512,
            tms: false
        });

    map.addLayer(tilelayer);
    map.setView([-41.289926, 174.775172], 8);

    function onMapMouseMove(e) {
    //  console.log("xy: " + e.latlng);
    }

    map.on('mousemove', onMapMouseMove);






	L.Util.requestAnimFrame(map.invalidateSize,map,!1,map._container);
        return this;
    },

    events: {
        "change"        : "change",
        "click .save"   : "beforeSave",
        "click .delete" : "deleteWine",
        "drop #picture" : "dropHandler",
	"dragover #picture" : "dragoverHandler"
    },

    change: function (event) {
        // Remove any existing alert message
        utils.hideAlert();

        // Apply the change to the model
        var target = event.target;
        var change = {};
        change[target.name] = target.value;
        this.model.set(change);

        // Run validation rule (if any) on changed item
        var check = this.model.validateItem(target.id);
        if (check.isValid === false) {
            utils.addValidationError(target.id, check.message);
        } else {
            utils.removeValidationError(target.id);
        }
    },

    beforeSave: function () {
        var self = this;
        var check = this.model.validateAll();
        if (check.isValid === false) {
            utils.displayValidationErrors(check.messages);
            return false;
        }
        this.saveWine();
        return false;
    },

    saveWine: function () {
        var self = this;
        console.log('before save');
        this.model.save(null, {
            success: function (model) {
                self.render();
                app.navigate('wines/' + model.id, false);
                utils.showAlert('Success!', 'Wine saved successfully', 'alert-success');
            },
            error: function () {
                utils.showAlert('Error', 'An error occurred while trying to delete this item', 'alert-error');
            }
        });
    },

    deleteWine: function () {
        this.model.destroy({
            success: function () {
                alert('Wine deleted successfully');
                window.history.back();
            }
        });
        return false;
    },

    dropHandler: function (event) {
        event.stopPropagation();
        event.preventDefault();
        var e = event.originalEvent;
        e.dataTransfer.dropEffect = 'copy';
        this.pictureFile = e.dataTransfer.files[0];

        // Read the image file from the local file system and display it in the img tag
        var reader = new FileReader();
        reader.onloadend = function () {
            $('#picture').attr('src', reader.result);
        };
        reader.readAsDataURL(this.pictureFile);
    },
    dragoverHandler: function(event) {
        event.preventDefault();
    }

});

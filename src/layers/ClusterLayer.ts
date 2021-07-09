/*
 * @Author: yongju
 * @Date: 2021-07-08 19:45:34
 * @LastEditors: Mochi
 * @LastEditTime: 2021-07-10 00:51:31
 * @Description: 
 */

// @ts-ignore
(function() {
    'use strict';
  
    // save the original methods before overwriting them
    Element.prototype._addEventListener = Element.prototype.addEventListener;
    Element.prototype._removeEventListener = Element.prototype.removeEventListener;
  
    /**
     * [addEventListener description]
     * @param {[type]}  type       [description]
     * @param {[type]}  listener   [description]
     * @param {Boolean} useCapture [description]
     */
    Element.prototype.addEventListener = function(type,listener,useCapture=false) {
        // declare listener
        this._addEventListener(type,listener,useCapture);
  
        if(!this.eventListenerList) this.eventListenerList = {};
        if(!this.eventListenerList[type]) this.eventListenerList[type] = [];
  
        // add listener to  event tracking list
        this.eventListenerList[type].push( {type, listener, useCapture} );
    };
  
    /**
     * [removeEventListener description]
     * @param  {[type]}  type       [description]
     * @param  {[type]}  listener   [description]
     * @param  {Boolean} useCapture [description]
     * @return {[type]}             [description]
     */
    Element.prototype.removeEventListener = function(type,listener,useCapture=false) {
        // remove listener
        this._removeEventListener(type,listener,useCapture);
  
        if(!this.eventListenerList) this.eventListenerList = {};
        if(!this.eventListenerList[type]) this.eventListenerList[type] = [];
  
        // Find the event in the list, If a listener is registered twice, one
        // with capture and one without, remove each one separately. Removal of
        // a capturing listener does not affect a non-capturing version of the
        // same listener, and vice versa.
        for(let i=0; i<this.eventListenerList[type].length; i++){
            if( this.eventListenerList[type][i].listener===listener && this.eventListenerList[type][i].useCapture===useCapture){
                this.eventListenerList[type].splice(i, 1);
                break;
            }
        }
        // if no more events of the removed event type are left,remove the group
        if(this.eventListenerList[type].length==0) delete this.eventListenerList[type];
    };
  
  
    /**
     * [getEventListeners description]
     * @param  {[type]} type [description]
     * @return {[type]}      [description]
     */
    Element.prototype.getEventListeners = function(type){
        if(!this.eventListenerList) this.eventListenerList = {};
  
        // return reqested listeners type or all them
        if(type===undefined)  return this.eventListenerList;
        return this.eventListenerList[type];
    };
  
  
    /*
    Element.prototype.clearEventListeners = function(a){
        if(!this.eventListenerList)
            this.eventListenerList = {};
        if(a==undefined){
            for(var x in (this.getEventListeners())) this.clearEventListeners(x);
            return;
        }
        var el = this.getEventListeners(a);
        if(el==undefined)
            return;
        for(var i = el.length - 1; i >= 0; --i) {
            var ev = el[i];
            this.removeEventListener(a, ev.listener, ev.useCapture);
        }
    };
    */
  
})();
export class ClusterLayer {
  id: any;
  getIcon: any;
  getPosition: any;
  getClusterBackgroundImage: any;
  clusterZooms: any;
  maxzoom: number;
  clusterRadius: any;
  _applyData: any;
  sourceId: string;
  layerId: string;
  map: any;
  data: unknown;
  sources: any;
  layers: any;
  setViewState: any;
  getSize: any;
  width: undefined;
  height: undefined;
  onIconClick: any;
  constructor(options: any = {}, setViewState: any, onIconClick: any) {
    this.id = options.id;
    this.setViewState = setViewState;
    this.onIconClick = onIconClick;
    this.getIcon =
      options.getIcon ||
      function () {
        return '';
      };
    this.getPosition =
      options.getPosition ||
      function () {
        return [0, 0];
      };
    this.getSize =
      options.getSize ||
      function () {
        return 45;
      };
    this.getClusterBackgroundImage =
      options.getClusterBackgroundImage ||
      function () {
        return [0, 0];
      };

    this.clusterZooms = (options.clusterZooms || [10, 14]).map((zoom: number) => {
      return zoom - 1;
    });
    this.maxzoom = Math.max.apply(null, this.clusterZooms);
    this.clusterRadius = options.clusterRadius || 50;

    this.data = options.data;

    this.sourceId = this.id + '_source';
    this.layerId = this.id + '_point';
  }

  setData(data: any) {
    return this.formatToGeoJson(data).then((geojson) => {
      //this.map.getSource(this.sourceId).setData(geojson);
      this.sources[this.sourceId].data = geojson;
    });
  }

  formatToGeoJson(data: any = []) {
    var _this = this;
    return new Promise((resolve) => {
      if (data.length === 0) {
        resolve({
          type: 'FeatureCollection',
          features: [],
        });
      } else {
        let geojsonData: any = {
          type: 'FeatureCollection',
          features: [],
        };
        let images: any[] = [];
        let imageAll = [];

        imageAll.push(
          new Promise((resolve) => {
            this.map.loadImage(this.getClusterBackgroundImage(), (err: any, image: any) => {
              if (err) {
                resolve(true);
                return;
              }
              _this.map.addImage(this.id + 'clusterBg', image);
              resolve(true);
            });
          }),
        );

        for (let i = 0; i < data.length; i++) {
          let iconSize = this.getSize(data[i]);
          let imageId = this.getIcon(data[i]) + '&&&&' + iconSize;
          if (imageId && images.indexOf(imageId) === -1 && !this.map.hasImage(imageId)) {
            images.push(imageId);
          }
          let feature = {
            type: 'Feature',
            properties: {
              ...data[i],
              _imageId: imageId,
              _iconSize: iconSize,
            },
            geometry: {
              type: 'Point',
              coordinates: this.getPosition(data[i]),
            },
          };
          geojsonData.features.push(feature);
        }
        for (let i = 0; i < images.length; i++) {
          (function (i) {
            imageAll.push(
              new Promise((resolve, reject) => {
                if (!_this.map.hasImage(images[i])) {
                  let imgInfo = images[i].split('&&&&');
                  let url = imgInfo[0];
                  let width = parseFloat(imgInfo[1]);
                  _this.map.loadImage(url, (err: any, image: any) => {
                    if (err) {
                      console.error('图片加载失败:' + images[i]);
                      resolve(true);
                      return;
                    }
                    image = resizeImage(width, width, image);
                    if (!_this.map.hasImage(images[i])) {
                      _this.map.addImage(images[i], image);
                    }
                    resolve(true);
                  });
                } else {
                  resolve(true);
                }
              }),
            );
          })(i);
        }

        if (imageAll.length > 0) {
          Promise.all(imageAll).then(() => {
            resolve(geojsonData);
          });
        } else {
          resolve(geojsonData);
        }
      }
    });
  }

  remove() {
    this.map.removeLayer(this.id + 'clusters');
    this.map.removeLayer(this.id + 'cluster-count');
    this.map.removeLayer(this.id + 'cluster-count');
    this.map.removeSource(this.sourceId);
  }

  drill(point: any) {
    var features = this.map.queryRenderedFeatures(point, {
      layers: [this.id + 'clusters', this.id + 'cluster-count'],
    });
    if (features.length > 0) {
      let zoom = this.map.getZoom();
      let clusterZooms = this.clusterZooms;
      for (let i = 0; i < clusterZooms.length; i++) {
        let zoomStop = clusterZooms[i] + 1;
        if (zoom < zoomStop) {
          const coords = features[0].geometry.coordinates;
          this.setViewState({
            latitude: coords[1],
            longitude: coords[0], //120.030237
            zoom: zoomStop,
          });
          break;
        }
      }
    }
  }

  getFeature(point: any) {
    var features = this.map.queryRenderedFeatures(point, {
      layers: [this.id + 'unclustered-point'],
    });
    if (features.length > 0) {
      return features[0];
    }
    return null;
  }

  run(map: any) {
    this.map = map;

    this.sources = {
      [this.sourceId]: {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
        cluster: true,
        clusterMaxZoom: this.maxzoom,
        clusterRadius: this.clusterRadius,
      },
    };

    this.layers = [
      {
        id: this.id + 'clusters',
        type: 'symbol',
        source: this.sourceId,
        //filter: ['has', 'point_count'],
        minzoom: 0,
        maxzoom: this.maxzoom + 1,
        layout: {
          'icon-image': this.id + 'clusterBg',
          'icon-allow-overlap': true,
          'icon-size': [
            'interpolate',
            ['linear'],
            ['to-number', ['get', 'point_count']],
            2,
            0.5,
            100,
            1,
            750,
            1.8,
          ],
        },
      },
      {
        id: this.id + 'cluster-count',
        type: 'symbol',
        source: this.sourceId,
        minzoom: 0,
        maxzoom: this.maxzoom + 1,
        layout: {
          'text-field': [
            'case',
            ['has', 'point_count_abbreviated'],
            ['get', 'point_count_abbreviated'],
            '1',
          ],
          //'text-font': [''],
          'text-size': 16,
          'icon-allow-overlap': true,
        },
        paint: {
          'text-color': 'white',
        },
      },
      {
        id: this.id + 'unclustered-point',
        type: 'symbol',
        minzoom: this.maxzoom + 1,
        source: this.sourceId,
        filter: ['!', ['has', 'point_count']],
        layout: {
          'icon-image': ['get', '_imageId'],
          'icon-allow-overlap': true,
        },
      },
    ];

    map.style.glyphManager._doesCharSupportLocalGlyph = function () {
      return true;
    };

    let _tinySDF = map.style.glyphManager._tinySDF;
    if (!_tinySDF.rewrite) {
      map.style.glyphManager._tinySDF = function (e: any, i: any, o: any) {
        let res = _tinySDF.call(this, e, i, o);
        let advance = 24;
        let id = o;
        console.log(id);
        if (['f', 'i', 'j', 'l', 'r', 't'].indexOf(String.fromCharCode(id)) > -1) {
          advance = 12;
        } else if (['w', 'm'].indexOf(String.fromCharCode(id)) > -1) {
          advance = 24;
        } else if (id >= 97 && id <= 122) {
          advance = 16;
        } else if (id >= 48 && id <= 57) {
          advance = 14;
        } else {
          advance = 24;
        }
        res.metrics.advance = advance;
        return res;
      };
      map.style.glyphManager._tinySDF.rewrite = true;
    }


    const node = map.getContainer().parentNode.parentNode;
    node.getEventListeners().click&&node.getEventListeners().click.forEach((e: any)=>{
        node.removeEventListener('click',e.listener);
    })
    node.addEventListener("click", (e:any) => {
        // this.drill({
        //     x:e.offsetX,
        //     y:e.offsetY
        // })
        this.drill([e.offsetX,e.offsetY]);
        let feature = this.getFeature([e.offsetX,e.offsetY]);
        if(feature){
            this.onIconClick({
                object:feature.properties,
                event:e
            });
        }
    });

    return this.setData(this.data).then(() => {
      return this;
    });
  }
}

export function resizeImage(width: number, height: number, image: any) {
  let canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  let ctx = canvas.getContext('2d');
  ctx?.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);
  return ctx?.getImageData(0, 0, width, height);
}

export function parseClusterConfig(config: any, map: any, setViewState: any, onIconClick: any) {
  const layer = new ClusterLayer(config, setViewState, onIconClick);
  return layer.run(map);
}

export function createDefaultClusterBgImage(r: number, g: number, b: number) {
  let canvas = document.createElement('canvas');
  //稍微大点，防止失真
  canvas.width = 100;
  canvas.height = 100;
  let ctx: any = canvas.getContext('2d');
  ctx.beginPath();
  var grad = ctx.createRadialGradient(50, 50, 0, 50, 50, 50); //创建一个渐变色线性对象
  grad.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',1)');
  grad.addColorStop(0.7, 'rgba(' + r + ',' + g + ',' + b + ',0.9)'); //定义渐变色颜色
  grad.addColorStop(0.95, 'rgba(' + r + ',' + g + ',' + b + ',0.5)');
  grad.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',1)');
  ctx.fillStyle = grad;
  ctx.arc(50, 50, 50, 0, Math.PI * 2);
  ctx.fill();
  return canvas.toDataURL();
}

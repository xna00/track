import AMapLoader from "@amap/amap-jsapi-loader";
import { useEffect, useRef, useState } from "react";
import "./App.css";
import { fetchJSON } from "./main";
import { assert } from "./util";

type TAMap = typeof AMap;

type LngLat = [number, number];

const path: LngLat[] = [
  [121.49629, 31.16734],
  [121.50207, 31.16657],
  [121.50208, 31.16735],
  [121.48696, 31.16981],
];

function App() {
  const wrapper = useRef<HTMLDivElement>(null);
  const map = useRef<AMap.Map>();

  const [path, setPath] = useState<LngLat[]>([]);
  useEffect(() => {
    AMapLoader.load({
      key: "ac8d7530788b8e29b4ce6ee432386224", // 申请好的Web端开发者Key，首次调用 load 时必填
      version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
      plugins: ["AMap.Geolocation"], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
    })
      .then((AMap: TAMap) => {
        assert(wrapper.current);
        const _map = new AMap.Map(wrapper.current, {
          zoom: 14,
        });
        map.current = _map;

        _map.plugin("AMap.Geolocation", function () {
          const geolocation = new AMap.Geolocation({
            enableHighAccuracy: true, //是否使用高精度定位，默认:true
            timeout: 10000, //超过10秒后停止定位，默认：无穷大
            maximumAge: 0, //定位结果缓存0毫秒，默认：0
            convert: true, //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
            showButton: true, //显示定位按钮，默认：true
            buttonPosition: "LB", //定位按钮停靠位置，默认：'LB'，左下角
            buttonOffset: new AMap.Pixel(10, 20), //定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
            showMarker: true, //定位成功后在定位到的位置显示点标记，默认：true
            showCircle: true, //定位成功后用圆圈表示定位精度范围，默认：true
            panToLocation: true, //定位成功后将定位到的位置作为地图中心点，默认：true
            zoomToAccuracy: true, //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
          });
          _map.addControl(geolocation);
          // geolocation.getCurrentPosition((...args) => {
          //   console.log(args);
          // });
        });
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);

  function getPath() {
    fetchJSON(
      "/api/proxylark/https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/shtcnSrIMt5ZL0YEoLP7ea27zqf/values/db8dfc"
    ).then((res) => {
      console.log(res.data.valueRange.values);
      const p = res.data.valueRange.values
        .slice(1)
        .slice(-30)
        .map((v) => [v[1], v[0]]);
      setPath(p);
    });
  }

  useEffect(() => {
    console.log(path, map);
    if (!path.length || !map.current) return;
    map.current.clearMap();
    const polyline = new AMap.Polyline({
      path: path,
      isOutline: true,
      outlineColor: "#ffeeff",
      borderWeight: 1,
      strokeColor: "#3366FF",
      strokeOpacity: 1,
      strokeWeight: 4,
      // 折线样式还支持 'dashed'
      strokeStyle: "solid",
      // strokeStyle是dashed时有效
      strokeDasharray: [10, 5],
      lineJoin: "round",
      lineCap: "round",
      zIndex: 50,
      showDir: true,
    });

    polyline.setMap(map.current);
    map.current.setCenter(path[0]);
  }, [path]);

  useEffect(() => {
    getPath();
  }, []);

  return (
    <div className="relative">
      <button className="absolute z-100 right-0" onClick={getPath}>
        filter
      </button>
      <div className="w-screen h-screen" ref={wrapper}></div>
    </div>
  );
}

export default App;

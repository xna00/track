import { useRef, useState, useEffect } from "react";
import AMapLoader from "@amap/amap-jsapi-loader";
import { assert } from "../util/assert";
import { connection, Position, TABLE_NAME } from "../util/db";
import mapTools from "../util/mapTools";
import Setting from "../assets/setting.svg";
import Refresh from "../assets/refresh.svg";
import FilterIcon from "../assets/filter.svg";
import { Link } from "react-router-dom";
import Drawer from "./Drawer";
import { Form, InputRange, useForm } from "./Form";
import { getLocalISOString } from "../util/date";
import type { OmitFrom } from "../util/types";

type TAMap = typeof AMap;

type LngLat = [lng: number, lat: number];

type FormValue = {
  limit: number;
  createdAt: string[];
};
export default () => {
  const wrapper = useRef<HTMLDivElement>(null);
  const map = useRef<AMap.Map>();

  const [path, setPath] = useState<LngLat[]>([]);

  const [filter, setFilter] = useState<FormValue>({
    limit: 30,
    createdAt: [
      getLocalISOString(new Date().setHours(0, 0, 0, 0)),
      getLocalISOString(new Date().setHours(23, 59, 59, 0)),
    ],
  });
  useEffect(() => {
    AMapLoader.load({
      key: "ac8d7530788b8e29b4ce6ee432386224", // 申请好的Web端开发者Key，首次调用 load 时必填
      version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
      plugins: ["AMap.Geolocation"], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
    })
      .then((AMap: TAMap) => {
        console.log(AMap);
        assert(wrapper.current);
        const _map = new AMap.Map(wrapper.current, {
          zoom: 14,
        });
        map.current = _map;

        // _map.plugin("AMap.Geolocation", function () {
        //   const geolocation = new AMap.Geolocation({
        //     enableHighAccuracy: true, //是否使用高精度定位，默认:true
        //     timeout: 10000, //超过10秒后停止定位，默认：无穷大
        //     maximumAge: 0, //定位结果缓存0毫秒，默认：0
        //     convert: true, //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
        //     showButton: true, //显示定位按钮，默认：true
        //     buttonPosition: "LB", //定位按钮停靠位置，默认：'LB'，左下角
        //     buttonOffset: new AMap.Pixel(10, 20), //定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
        //     showMarker: true, //定位成功后在定位到的位置显示点标记，默认：true
        //     showCircle: true, //定位成功后用圆圈表示定位精度范围，默认：true
        //     panToLocation: true, //定位成功后将定位到的位置作为地图中心点，默认：true
        //     zoomToAccuracy: true, //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
        //   });
        //   _map.addControl(geolocation);
        // });
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);

  function getPath() {
    connection
      .select({
        from: TABLE_NAME,
        limit: filter?.limit || 30,
        order: {
          by: "createdAt",
          type: "desc",
        },
        where: filter && {
          createdAt: {
            "-": {
              low: getLocalISOString(filter.createdAt[0]),
              high: getLocalISOString(filter.createdAt[1]),
            },
          },
        },
      })
      .then((_res) => {
        const res = _res as Position[];
        console.log(res);
        setPath(
          res
            .sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            )
            .map((p) => ({ lng: p.longitude, lat: p.latitude }))
            .map((point) => mapTools.transformWGS2GCJ(point))
            .map((point) => [point.lng, point.lat])
        );
      });
  }

  useEffect(() => {
    console.log(filter);
    getPath();
  }, [filter]);

  useEffect(() => {
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
    map.current.setFitView([polyline]);
    path.forEach((p) => {
      map.current?.add(
        new AMap.Marker({
          position: p,
          content:
            '<div style="width:6px;height:6px;border-radius:50%;background:red"></div>',
          offset: new AMap.Pixel(-3, -3),
        })
      );
    });
  }, [path, map.current]);

  useEffect(() => {
    getPath();
  }, []);

  return (
    <div className="relative">
      <Link to="/config">
        <Setting className="absolute z-100 right-2 top-2" />
      </Link>
      <Filter
        className="absolute z-100 right-2 top-12"
        onSubmit={(value) => {
          setFilter(value);
        }}
      />
      <Refresh className="absolute z-100 right-2 bottom-2" onClick={getPath} />
      <div className="w-screen h-screen" ref={wrapper}></div>
    </div>
  );
};

const Filter = (
  props: OmitFrom<JSX.IntrinsicElements["svg"], "onSubmit"> & {
    onSubmit: (value: FormValue) => void;
  }
) => {
  const { onSubmit, ...rest } = props;
  const [visible, setVisible] = useState(false);
  const [Form, FormItem] = useForm<FormValue>();
  return (
    <>
      <FilterIcon onClick={() => setVisible(true)} {...rest} />
      <Drawer
        visible={visible}
        onClose={() => setVisible(false)}
        placement="right"
      >
        <div className="w-60 bg-white h-full">
          <Form
            onSubmit={(v) => {
              onSubmit({
                ...v,
                createdAt: v.createdAt.map(getLocalISOString),
              });
            }}
          >
            <FormItem name="limit" label="limit">
              <input type="number" defaultValue={30} />
            </FormItem>
            <FormItem name="createdAt" label="createdAt">
              <InputRange
                type="datetime-local"
                inputProps={[
                  {
                    defaultValue: getLocalISOString(
                      new Date().setHours(0, 0, 0, 0)
                    ).split(".")[0],
                  },
                  {
                    defaultValue: getLocalISOString(
                      new Date().setHours(23, 59, 0, 0)
                    ).split(".")[0],
                  },
                ]}
              />
            </FormItem>
            <div>
              <input type="submit" />
            </div>
          </Form>
        </div>
      </Drawer>
    </>
  );
};

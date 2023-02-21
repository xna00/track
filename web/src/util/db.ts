import { Connection } from "jsstore";
import workerInjector from "jsstore/dist/worker_injector";
import { fetchJSON } from "./fetchJSON";

export const DB_NAME = "track";
export const TABLE_NAME = "location";
export const connection = new Connection();

export const cols = [
    "latitude",
    "longitude",
    "altitude",
    "speed",
    "accuracy",
    "verticalAccuracy",
    "speedAccuracy",
    "time",
];

connection.addPlugin(workerInjector);

(async () => {
    await connection.initDb({
        name: DB_NAME,
        tables: [
            {
                name: TABLE_NAME,
                columns: {
                    latitude: { dataType: "number" },
                    longitude: { dataType: "number" },
                    altitude: { dataType: "number" },
                    speed: { dataType: "number" },
                    accuracy: { dataType: "number" },
                    verticalAccuracy: { dataType: "number" },
                    speedAccuracy: { dataType: "number" },
                    synced: { dataType: "number" },
                    createdAt: { dataType: "string" },
                },
            },
        ],
    });
    if (
        !(
            await connection.select({
                from: TABLE_NAME,
            })
        ).length
    ) {
        const res = await fetchJSON(
            "/api/proxylark/https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/shtcnSrIMt5ZL0YEoLP7ea27zqf/values/db8dfc"
        );
        const rows = res.data.valueRange.values.slice(1);
        console.log(rows);
        const values = rows.map((row: any[]) => {
            const t = Object.fromEntries(cols.map((col, i) => [col, row[i]]));
            return {
                ...t,
                synced: 1,
                createdAt: t.time,
            };
        });
        console.log(values);
        connection.insert({
            into: TABLE_NAME,
            values: values,
        });
    }
})();
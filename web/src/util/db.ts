import { Connection } from "jsstore";
import workerInjector from "jsstore/dist/worker_injector";
import { fetchJSON } from "./fetchJSON";

export const DB_NAME = "track";
export const TABLE_NAME = "location";
export const connection = new Connection();
connection.addPlugin(workerInjector);

export const cols = [
    "latitude",
    "longitude",
    "altitude",
    "speed",
    "accuracy",
    "verticalAccuracy",
    "speedAccuracy",
    "createdAt",
] as const;

export type Cols = typeof cols
export type Position = Omit<Record<Cols[number], number>, 'createdAt'> & {
    createdAt: string;
    synced: 0 | 1;
}

type TMap<A, M, R extends unknown[] = []> = A extends [infer F, ...infer B] ? TMap<B, M, [...R, M[F & keyof M]]> : R

export type Row = TMap<[...Cols], Position>

const rowToPosition = (row: Row) => ({
    ...Object.fromEntries(cols.map((col, i) => [col, row[i]])),
    synced: 1
}) as Position

export const positionToRow = (position: Position) => cols.map(col => position[col]) as Row;

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
    if (!(await connection.select({ from: TABLE_NAME, })).length) {
        const res = await fetchJSON(
            "/api/proxylark/https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/shtcnSrIMt5ZL0YEoLP7ea27zqf/values/db8dfc"
        );
        const rows = res.data.valueRange.values.slice(1) as Row[];
        console.log(rows);
        const values = rows.map(row => rowToPosition(row));
        console.log(values);
        await connection.insert({
            into: TABLE_NAME,
            values: values,
        });
    }
})();



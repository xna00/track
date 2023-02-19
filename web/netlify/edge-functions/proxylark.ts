import { fetchLark } from "../lark.ts";

export default (req: Request) => {
    const url = req.url.replace(/^.+?proxylark\//, "");
    return fetchLark(url, {
        headers: req.headers,
        method: req.method,
        body: req.body
    });
};

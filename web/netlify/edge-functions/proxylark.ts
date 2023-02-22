import { Context } from "https://edge.netlify.com";
import { fetchLark } from "../lark.ts";

const KEY = 'SECRET_TOKEN'

export default (req: Request, context: Context) => {
    const url = req.url.replace(/^.+?proxylark\//, "");
    console.log(context.cookies.get(KEY), Deno.env.get(KEY))
    if (!context.cookies.get(KEY)) {
        return new Response(null, {
            status: 401
        })
    }
    if (context.cookies.get(KEY) !== Deno.env.get(KEY)) {
        return new Response(null, {
            status: 403
        })
    }
    return fetchLark(url, {
        headers: req.headers,
        method: req.method,
        body: req.body
    });
};

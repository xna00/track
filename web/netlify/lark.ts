const token = {
    expireAt: -1,
    value: ''
}

export const fetchLark = async (input: RequestInfo | URL, init?: RequestInit) => {
    console.log(input)
    if (input !== 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal') {
        await getToken()
    }

    const res = await fetch(input, {
        ...init,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': `Bearer ${token.value}`,
            ...init?.headers,
        },
    })
    console.log(res)
    return res
}

async function getToken() {
    console.log(token)
    if (token.value && token.expireAt > new Date().getTime()) {
        return token.value
    }
    const res = await (await fetchLark('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
        method: 'post',
        body: JSON.stringify({
            app_id: Deno.env.get("LARK_APP_ID"),
            app_secret: Deno.env.get("LARK_APP_SECRET")
        })
    })).json()
    token.value = res.tenant_access_token;
    token.expireAt = new Date().getTime() + res.expire * 1000

    return token.value
}


// export async function appendLine(lines: unknown[]) {
//     return fetchJSON('https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/shtcnSrIMt5ZL0YEoLP7ea27zqf/values_append?insertDataOption=INSERT_ROWS', {
//         method: 'post',
//         body: {
//             "valueRange": {
//                 "range": "db8dfc",
//                 "values": lines
//             }
//         },
//     })
// }
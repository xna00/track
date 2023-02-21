
export const fetchJSON = async (
    input: RequestInfo | URL,
    init?: Omit<RequestInit, "body"> & { body?: any }
) => {
    const res = await fetch(input, {
        ...init,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            ...init?.headers,
        },
        body: init?.body ? JSON.stringify(init.body) : init?.body,
    });
    return await res.json();
};
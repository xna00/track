let count = 0
export default (req: Request) => {

  count++
  console.log(Deno.env.toObject());
  return new Response("hello" + count)
};
